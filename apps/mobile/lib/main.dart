import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const _apiUrl = String.fromEnvironment('CREDOS_API_URL', defaultValue: 'http://10.0.2.2:3000');
void main() => runApp(const CredosApp());

class CredosApi {
  CredosApi({this.token});
  final String? token;
  Map<String, String> get _headers => {'content-type': 'application/json', if (token != null) 'authorization': 'Bearer $token'};
  Future<Map<String, dynamic>> login(String email, String password) => _request('/v1/auth/login', method: 'POST', body: {'email': email, 'password': password});
  Future<List<CollectionCase>> collectionCases() async => ((await _request('/v1/collections')) as List).map((item) => CollectionCase.fromJson(item)).toList();
  Future<void> promise(String caseId, int amount, String dueDate) async => _request('/v1/collections/$caseId/promises', method: 'POST', body: {'amount': amount, 'dueDate': dueDate});
  Future<dynamic> _request(String path, {String method = 'GET', Map<String, dynamic>? body}) async {
    final response = await http.Request(method, Uri.parse('$_apiUrl$path'))..headers.addAll(_headers);
    if (body != null) response.body = jsonEncode(body);
    final streamed = await response.send(); final text = await streamed.stream.bytesToString(); final result = text.isEmpty ? null : jsonDecode(text);
    if (streamed.statusCode < 200 || streamed.statusCode >= 300) throw ApiException(result is Map ? '${result['error'] ?? 'Request failed'}' : 'Request failed');
    return result;
  }
}
class ApiException implements Exception { ApiException(this.message); final String message; @override String toString() => message; }
class CollectionCase {
  CollectionCase({required this.id, required this.status, required this.invoiceNumber, required this.outstanding, required this.dueDate, required this.promises});
  final String id, status, invoiceNumber, dueDate; final int outstanding; final List<dynamic> promises;
  factory CollectionCase.fromJson(dynamic json) { final invoice = json['invoice'] as Map<String, dynamic>; return CollectionCase(id: json['id'] as String, status: json['status'] as String, invoiceNumber: invoice['number'] as String, outstanding: invoice['outstanding'] as int, dueDate: invoice['dueDate'] as String, promises: json['promises'] as List<dynamic>); }
}
class CredosApp extends StatefulWidget { const CredosApp({super.key}); @override State<CredosApp> createState() => _CredosAppState(); }
class _CredosAppState extends State<CredosApp> {
  CredosApi? api; List<CollectionCase> cases = []; bool loading = false; String? error;
  Future<void> signIn(String email, String password) async { setState(() { loading = true; error = null; }); try { final session = await CredosApi().login(email, password); api = CredosApi(token: session['token'] as String); await loadCases(); } on ApiException catch (exception) { setState(() => error = exception.message); } finally { if (mounted) setState(() => loading = false); } }
  Future<void> loadCases() async { if (api == null) return; setState(() { loading = true; error = null; }); try { cases = await api!.collectionCases(); } on ApiException catch (exception) { error = exception.message; } finally { if (mounted) setState(() => loading = false); } }
  @override Widget build(BuildContext context) => MaterialApp(title: 'CredOS', theme: ThemeData(colorSchemeSeed: const Color(0xff1d4ed8), useMaterial3: true), home: api == null ? LoginPage(onSignIn: signIn, error: error, loading: loading) : CollectionListPage(cases: cases, loading: loading, onRefresh: loadCases, onOpen: (item) => Navigator.push(context, MaterialPageRoute(builder: (_) => CasePage(api: api!, item: item, onSaved: loadCases))));
}
class LoginPage extends StatefulWidget { const LoginPage({super.key, required this.onSignIn, this.error, required this.loading}); final Future<void> Function(String, String) onSignIn; final String? error; final bool loading; @override State<LoginPage> createState() => _LoginPageState(); }
class _LoginPageState extends State<LoginPage> { final email = TextEditingController(text: 'admin@credos.local'); final password = TextEditingController(text: 'ChangeMe123!'); @override Widget build(BuildContext context) => Scaffold(body: SafeArea(child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 420), child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.stretch, children: [Text('CredOS', style: Theme.of(context).textTheme.displaySmall), const SizedBox(height: 8), const Text('Field collections'), const SizedBox(height: 24), TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')), TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')), if (widget.error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(widget.error!, style: const TextStyle(color: Colors.red))), const SizedBox(height: 20), FilledButton(onPressed: widget.loading ? null : () => widget.onSignIn(email.text, password.text), child: Text(widget.loading ? 'Signing in...' : 'Sign in'))])))));
}
class CollectionListPage extends StatelessWidget { const CollectionListPage({super.key, required this.cases, required this.loading, required this.onRefresh, required this.onOpen}); final List<CollectionCase> cases; final bool loading; final Future<void> Function() onRefresh; final ValueChanged<CollectionCase> onOpen; @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('My collections'), actions: [IconButton(onPressed: loading ? null : onRefresh, icon: const Icon(Icons.refresh))]), body: loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(onRefresh: onRefresh, child: ListView.builder(itemCount: cases.length, itemBuilder: (context, index) { final item = cases[index]; return ListTile(title: Text(item.invoiceNumber), subtitle: Text('Due ${item.dueDate} • ${item.promises.length} promise(s)'), trailing: Text('₹${(item.outstanding / 100).toStringAsFixed(2)}'), onTap: () => onOpen(item)); }))); }
class CasePage extends StatefulWidget { const CasePage({super.key, required this.api, required this.item, required this.onSaved}); final CredosApi api; final CollectionCase item; final Future<void> Function() onSaved; @override State<CasePage> createState() => _CasePageState(); }
class _CasePageState extends State<CasePage> { final amount = TextEditingController(); DateTime dueDate = DateTime.now(); String? error; bool saving = false; Future<void> save() async { final value = int.tryParse(amount.text); if (value == null || value <= 0) { setState(() => error = 'Enter an amount in paise.'); return; } setState(() { saving = true; error = null; }); try { await widget.api.promise(widget.item.id, value, dueDate.toIso8601String().substring(0, 10)); await widget.onSaved(); if (mounted) Navigator.pop(context); } on ApiException catch (exception) { setState(() => error = exception.message); } finally { if (mounted) setState(() => saving = false); } } @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: Text(widget.item.invoiceNumber)), body: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [Text('Outstanding: ₹${(widget.item.outstanding / 100).toStringAsFixed(2)}', style: Theme.of(context).textTheme.titleLarge), const SizedBox(height: 24), TextField(controller: amount, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Promise amount (paise)')), const SizedBox(height: 12), ListTile(title: const Text('Promise date'), subtitle: Text(dueDate.toIso8601String().substring(0, 10)), trailing: const Icon(Icons.calendar_today), onTap: () async { final picked = await showDatePicker(context: context, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)), initialDate: dueDate); if (picked != null) setState(() => dueDate = picked); }), if (error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(error!, style: const TextStyle(color: Colors.red))), const Spacer(), FilledButton(onPressed: saving ? null : save, child: Text(saving ? 'Saving...' : 'Record promise'))])));
}

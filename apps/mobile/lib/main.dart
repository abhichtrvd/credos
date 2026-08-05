import 'package:flutter/material.dart';

void main() => runApp(const CredosApp());
class CredosApp extends StatelessWidget {
  const CredosApp({super.key});
  @override Widget build(BuildContext context) => MaterialApp(theme: ThemeData(colorSchemeSeed: const Color(0xff1d4ed8)), home: const DashboardPage());
}
class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('CredOS')), body: const Center(child: Text('Sign in to view your assigned collections.')));
}

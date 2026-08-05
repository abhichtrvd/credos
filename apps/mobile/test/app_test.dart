import 'package:flutter_test/flutter_test.dart';
import 'package:credos_mobile/main.dart';

void main() {
  testWidgets('shows the mobile collections sign-in screen', (tester) async {
    await tester.pumpWidget(const CredosApp());
    expect(find.text('Field collections'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
  });
}

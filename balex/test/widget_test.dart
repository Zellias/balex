// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:balex/main.dart';
import 'package:balex/ui/layout/discord_scaffold.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('BaleX App shows dedicated LoginScreen when unauthenticated', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1280, 800);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const BaleXApp());
    await tester.pumpAndSettle();

    // Verify LoginScreen is shown with title and phone field
    expect(find.text('ورود به بله | BaleX'), findsOneWidget);
    expect(find.text('شماره موبایل خود را وارد کنید'), findsOneWidget);
    expect(find.text('دریافت کد تایید'), findsOneWidget);
    expect(find.text('ورود به عنوان مهمان (حالت آزمایشی)'), findsOneWidget);
  });

  testWidgets('BaleX App guest login transitions to DiscordScaffold on desktop layout', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1280, 800);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const BaleXApp());
    await tester.pumpAndSettle();

    // Tap guest login button
    final guestButton = find.text('ورود به عنوان مهمان (حالت آزمایشی)');
    expect(guestButton, findsOneWidget);
    await tester.tap(guestButton);
    await tester.pumpAndSettle();

    // Verify RTL Directionality is applied to DiscordScaffold
    final scaffoldContext = tester.element(find.byType(DiscordScaffold));
    expect(Directionality.of(scaffoldContext), TextDirection.rtl);

    // Verify Discord navigation modules and Bale banking are present
    expect(find.textContaining('بله'), findsWidgets);
  });

  testWidgets('BaleX App mobile layout with sliding drawers and header buttons', (WidgetTester tester) async {
    // Configure mobile screen size (e.g. 390x844)
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const BaleXApp());
    await tester.pumpAndSettle();

    // Enter guest mode to get to DiscordScaffold
    final guestButton = find.text('ورود به عنوان مهمان (حالت آزمایشی)');
    expect(guestButton, findsOneWidget);
    await tester.tap(guestButton);
    await tester.pumpAndSettle();

    // Find the menu icon (hamburger) to open right drawer (channels/servers)
    final menuButton = find.byIcon(Icons.menu_rounded);
    expect(menuButton, findsOneWidget);

    // Tap menu button to open right drawer
    await tester.tap(menuButton);
    await tester.pumpAndSettle();

    // Verify drawer opened with server/module rail and channel items
    expect(find.textContaining('کانال‌ها و گروه‌ها'), findsOneWidget);

    // Close drawer
    final scaffoldState = tester.state<ScaffoldState>(find.byType(Scaffold));
    expect(scaffoldState.isDrawerOpen, isTrue);

    scaffoldState.closeDrawer();
    await tester.pumpAndSettle();
    expect(scaffoldState.isDrawerOpen, isFalse);

    // Find the members icon to open left drawer (endDrawer)
    final membersButton = find.byIcon(Icons.people_alt_rounded);
    expect(membersButton, findsOneWidget);

    // Tap members button to open left drawer
    await tester.tap(membersButton);
    await tester.pumpAndSettle();
    expect(scaffoldState.isEndDrawerOpen, isTrue);

    // Verify endDrawer has member/banking content
    expect(find.textContaining('امور مالی این گفتگو'), findsOneWidget);
  });

  testWidgets('BaleX App mobile swipe gestures open drawers', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const BaleXApp());
    await tester.pumpAndSettle();

    // Enter guest mode
    final guestButton = find.text('ورود به عنوان مهمان (حالت آزمایشی)');
    expect(guestButton, findsOneWidget);
    await tester.tap(guestButton);
    await tester.pumpAndSettle();

    final scaffoldState = tester.state<ScaffoldState>(find.byType(Scaffold));
    expect(scaffoldState.isDrawerOpen, isFalse);
    expect(scaffoldState.isEndDrawerOpen, isFalse);

    // In RTL, drawer is at the right edge (x=390). Dragging from right edge to left opens drawer.
    await tester.dragFrom(const Offset(385, 300), const Offset(-200, 0));
    await tester.pumpAndSettle();
    expect(scaffoldState.isDrawerOpen, isTrue);

    // Close drawer
    scaffoldState.closeDrawer();
    await tester.pumpAndSettle();
    expect(scaffoldState.isDrawerOpen, isFalse);

    // In RTL, endDrawer is at the left edge (x=0). Dragging from left edge to right opens endDrawer.
    await tester.dragFrom(const Offset(5, 300), const Offset(200, 0));
    await tester.pumpAndSettle();
    expect(scaffoldState.isEndDrawerOpen, isTrue);
  });
}


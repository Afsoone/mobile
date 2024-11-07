import 'package:flutter/material.dart';

final ThemeData appTheme = ThemeData(
  primaryColor: const Color(0xFFFFC400), // Purple
  scaffoldBackgroundColor: const Color(0xFF121212), // Dark background
  textTheme: const TextTheme(
    bodyLarge: TextStyle(color: Colors.white),
    bodyMedium: TextStyle(color: Colors.white),
  ),
  bottomNavigationBarTheme: const BottomNavigationBarThemeData(
    backgroundColor: Color(0xFF1A1A1A),
    selectedItemColor: Color(0xFFFFC400),
    unselectedItemColor: Colors.white,
  ), colorScheme: ColorScheme.fromSwatch().copyWith(secondary: const Color(0xFF4B0082)),
);

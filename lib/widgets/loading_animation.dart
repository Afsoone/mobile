import 'package:flutter/material.dart';

class LoadingAnimation extends StatelessWidget {
  const LoadingAnimation({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.5),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFFFC400)),
            ),
            SizedBox(height: 20),
            Text(
              '...در حال بارگذاری',
              style: TextStyle(
                color: Color(0xFFFFC400),
                fontFamily: 'Vazir',
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

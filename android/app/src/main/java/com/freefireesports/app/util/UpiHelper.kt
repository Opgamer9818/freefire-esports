package com.freefireesports.app.util

import android.graphics.Bitmap
import android.net.Uri
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

object UpiHelper {

    // Standard UPI payment-intent URI. Amount is baked in and not
    // user-editable inside the app — matches "user must not be able to
    // change the amount inside the payment flow".
    fun buildUpiUri(upiId: String, payeeName: String, amountRupees: Int, note: String): String {
        val encodedName = Uri.encode(payeeName)
        val encodedNote = Uri.encode(note)
        return "upi://pay?pa=$upiId&pn=$encodedName&am=$amountRupees.00&cu=INR&tn=$encodedNote"
    }

    fun generateQrBitmap(content: String, sizePx: Int = 512): Bitmap {
        val bitMatrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, sizePx, sizePx)
        val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.RGB_565)
        for (x in 0 until sizePx) {
            for (y in 0 until sizePx) {
                bitmap.setPixel(x, y, if (bitMatrix.get(x, y)) android.graphics.Color.BLACK else android.graphics.Color.WHITE)
            }
        }
        return bitmap
    }
}

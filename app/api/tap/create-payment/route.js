import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency, customerEmail, customerPhone, customerName, orderId } = body;

    const tapResponse = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        customer: {
          first_name: customerName || "Customer",
          email: customerEmail || "example@mail.com",
          phone: {
            country_code: "966", // تقدر تعدل الكود حسب الدولة
            number: customerPhone || "000000000",
          },
        },
        source: {
          id: "src_all", // بيسمح لكل وسائل الدفع
        },
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?orderId=${orderId}`,
        },
      }),
    });

    const data = await tapResponse.json();

    if (data.errors) {
      return NextResponse.json({ success: false, error: data.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, paymentUrl: data.transaction.url });
  } catch (error) {
    console.error("TAP ERROR:", error);
    return NextResponse.json({ success: false, message: "Error creating payment" }, { status: 500 });
  }
}

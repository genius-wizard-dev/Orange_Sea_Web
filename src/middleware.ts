import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ENDPOINTS } from "./service/api.endpoint";
import apiService from "./service/api.service";

const REGISTER_IS_PENDING = ["/register"];
const PROTECTED_AUTH_PAGES = [
  "/login",
  "/forgot-password",
  ...REGISTER_IS_PENDING,
];
const OTP_PAGE = "/otp";
const HOME_PAGE = "/";

const checkRegister = async (data: {
  key: string;
  email: string;
}): Promise<boolean> => {
  try {
    // Send key as data, not just passing the key string directly
    const checkKey: { status: string } = await apiService.post<{
      status: string;
    }>(ENDPOINTS.AUTH.IS_REGISTER, { key: data.key, email: data.email });

    console.log(checkKey);
    if (checkKey.status === "success") {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const key = request.cookies.get("register_key")?.value;
  const email = request.cookies.get("register_email")?.value;
  const pathname = request.nextUrl.pathname;
  const referer = request.headers.get("referer") || "/";

  console.log("📍 PATH:", pathname);

  const isProtectedAuthPage = PROTECTED_AUTH_PAGES.some((path) =>
    pathname.startsWith(path)
  );
  const isRegister = REGISTER_IS_PENDING.some((path) =>
    pathname.startsWith(path)
  );
  const isOtpPage = pathname === OTP_PAGE;
  const isHomePage = pathname === HOME_PAGE;

  // Redirect to homepage if already logged in and trying to access auth pages
  if (token && isProtectedAuthPage) {
    console.log("🚫 Đã login → Redirect");

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to login if not logged in and trying to access the home page
  if (!token && isHomePage) {
    console.log("🚫 Chưa login → Redirect to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check OTP page access - must have valid key
  if (isOtpPage) {
    if (!key || !email) {
      console.log("🚫 Không có register_key → Redirect to referer");
      return NextResponse.redirect(new URL(referer, request.url));
    }

    const isValidKey = await checkRegister({ key, email });
    if (!isValidKey) {
      console.log("🚫 register_key không hợp lệ → Redirect to referer");
      const response = NextResponse.redirect(new URL(referer, request.url));
      response.cookies.delete("register_key");
      response.cookies.delete("register_email");
      return response;
    }
  }

  // Handle register with key
  if (key && isRegister && email) {
    const isValidKey = await checkRegister({ key, email });
    if (isValidKey) {
      console.log("🚫 Đã có register_key → Redirect to OTP");
      return NextResponse.redirect(new URL("/otp", request.url));
    } else {
      const response = NextResponse.next();
      response.cookies.delete("register_key");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register/:path*", "/forgot-password", "/otp", "/"],
};

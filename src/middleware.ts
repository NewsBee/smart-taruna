// pages/_middleware.ts

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const requestedPage = req.nextUrl.pathname;
  // Mengabaikan asset statis (gambar, CSS, JS, dll.)
  if (/\.(png|jpg|jpeg|gif|css|js|svg|ico)$/.test(requestedPage)) {
    return NextResponse.next();
  }

  if (requestedPage.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (requestedPage.startsWith('/api')) {
    return NextResponse.next();
  }

  // Jika pengguna sudah terotentikasi dan mencoba mengakses halaman login atau sign-up
  if (token && (requestedPage === '/auth/sign-in' || requestedPage === '/auth/sign-up')) {
    const url = req.nextUrl.clone();
    url.pathname = '/'; // Redirect ke dashboard
    return NextResponse.redirect(url);
  }

  // Jika pengguna mencoba mengakses halaman dashboard dan bukan 'admin'
  if (requestedPage.startsWith('/ujian')) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/'; // Redirect ke halaman akses terlarang
      return NextResponse.redirect(url);
    }
  }

  // Jika pengguna mencoba mengakses halaman dashboard dan bukan 'admin'
  if (requestedPage.startsWith('/dashboard')) {
    if (!token || token.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/ujian'; // Redirect ke halaman akses terlarang
      return NextResponse.redirect(url);
    }
  }

  // Jika pengguna tidak terotentikasi dan mencoba mengakses halaman lain selain '/', '/auth/sign-in', dan '/auth/sign-up'
  if (!token && requestedPage !== '/' && requestedPage !== '/auth/sign-in' && requestedPage !== '/auth/sign-up') {
    const url = req.nextUrl.clone();
    url.pathname = requestedPage; // Redirect ke halaman login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};

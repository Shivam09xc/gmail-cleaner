import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  const session = await getServerSession();
  const accessToken = (session as any)?.accessToken;

  if (!session || !accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth });

    // Gmail profile se unread count lo
    const profile = await gmail.users.getProfile({ userId: "me" });
    const threadsTotal = profile.data.threadsTotal || 0;

    // Unread threads count
    const unreadRes: any = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread -is:starred -is:important -in:sent -in:drafts -in:spam",
      maxResults: 1,
    });

    // Estimate for display
    const unreadCount = unreadRes.data.resultSizeEstimate || 0;

    return NextResponse.json({
      unreadCount,
      email: profile.data.emailAddress,
      threadsTotal,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

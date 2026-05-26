import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST() {
  // Session check — login hai ya nahi
  const session = await getServerSession();
  const accessToken = (session as any)?.accessToken;

  if (!session || !accessToken) {
    return NextResponse.json(
      { error: "Login nahi hai. Pehle Google se login karo." },
      { status: 401 }
    );
  }

  try {
    // Gmail API client setup
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth });

    let totalMarked = 0;
    let pageToken: string | undefined = undefined;

    // Saare unread emails fetch karo — page by page
    do {
      const listRes = await gmail.users.messages.list({
        userId: "me",
        q: "is:unread -is:starred -is:important -in:sent -in:drafts -in:spam",
        maxResults: 500,
        pageToken: pageToken,
      });

      const messages = listRes.data.messages || [];
      if (messages.length === 0) break;

      // Saare message IDs nikalo
      const messageIds = messages
        .map((m) => m.id)
        .filter(Boolean) as string[];

      // Batch mein mark as read karo (Gmail batchModify — ek API call mein sab)
      if (messageIds.length > 0) {
        await gmail.users.messages.batchModify({
          userId: "me",
          requestBody: {
            ids: messageIds,
            removeLabelIds: ["UNREAD"], // UNREAD label hata do
          },
        });
        totalMarked += messageIds.length;
      }

      pageToken = listRes.data.nextPageToken ?? undefined;

      // Rate limit se bachne ke liye thoda ruko
      if (pageToken) {
        await new Promise((r) => setTimeout(r, 300));
      }
    } while (pageToken);

    return NextResponse.json({
      success: true,
      totalMarked,
      message: `${totalMarked} emails mark as read ho gaye!`,
    });
  } catch (error: any) {
    console.error("Gmail API Error:", error);
    return NextResponse.json(
      {
        error: "Kuch error aaya. Dobara login karke try karo.",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

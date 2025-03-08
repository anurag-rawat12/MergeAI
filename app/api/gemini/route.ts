import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extraPrompt } from "@/components/extraPrompt";

export async function POST(req: Request) {
    try {

        const extra = extraPrompt;

        const { prompt, summaries = [] } = await req.json();
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


        const fullPrompt = `${extra} + "\n\n\n" Previous conversation summaries: ${summaries.join(" ")}. Now answer: ${prompt}`;

        const response = await model.generateContent(fullPrompt);
        const answer = response.response.text();

        const summaryPrompt = `Summarize this in one sentence: ${answer}`;
        const summaryResponse = await model.generateContent(summaryPrompt);
        const summary = summaryResponse.response.text();


        return NextResponse.json({ answer, summary });

    } catch (e) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

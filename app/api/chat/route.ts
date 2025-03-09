import { extraPrompt } from "@/components/extraPrompt";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {

        const { prompt, model, summaries = [] } = await req.json();
        const extra = extraPrompt;

        const fullPrompt = `${extra} + "\n\n\n" Previous conversation summaries: ${summaries.join(" ")}. Now answer: ${prompt}`;
        const token = process.env.GITHUB_MARKETPLACE_TOKEN!;

        const client = ModelClient(
            "https://models.inference.ai.azure.com",
            new AzureKeyCredential(token)
        );

        const fullResponse = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: '' },
                    { role: "user", content: fullPrompt }
                ],
                model: model,
                max_tokens: 4000,
            }
        });

        if (isUnexpected(fullResponse)) {
            throw fullResponse.body.error;
        }

        const responseText = fullResponse.body.choices[0].message.content

        const summary = await client.path("/chat/completions").post({
            body: {
                model: model,
                messages: [
                    { role: "user", content: `Summarize the following response in one sentence. ${responseText!}` }
                ],
                max_tokens: 1000,
            }
        });

        if (isUnexpected(summary)) {
            throw summary.body.error;
        }

        const summaryText = summary.body.choices[0].message.content


        return NextResponse.json({
            responseText,
            summaryText
        });

    } catch (e) {
        console.log(e);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}
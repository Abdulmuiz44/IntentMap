import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function listRedditTools() {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    try {
        console.log("Calling tools.getRawComposioTools()...");
        // @ts-ignore
        const tools = await composio.tools.getRawComposioTools({
            apps: ["reddit"],
        } as any);

        console.log(`Found ${tools.length} tools for Reddit.`);
        
        tools.forEach((t: any) => {
            console.log(`Name: ${t.name}, Slug: ${t.slug || t.id || t.name}`);
            if (t.description) console.log(`  Description: ${t.description}`);
            if (t.parameters) console.log(`  Params: ${JSON.stringify(t.parameters)}`);
            console.log("---");
        });

    } catch (e) {
        console.error("Error listing tools:", e);
    }
}

listRedditTools();

import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

async function inspectComposio() {
    const composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    // Inspect the tools object
    console.log("Composio instance keys:", Object.keys(composio));
    console.log("Composio.tools keys:", Object.keys(composio.tools));
    console.log("Composio.tools prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(composio.tools)));

    // Try to find a method that looks like it lists tools
    // Common names: getTools, list, listTools, getActions
    
    try {
        // @ts-ignore
        if (composio.tools.list) {
            console.log("Calling tools.list()...");
            // @ts-ignore
            const tools = await composio.tools.list();
            console.log("Tools found (first 5):", tools.slice(0, 5));
            
            const redditTools = tools.filter((t: any) => JSON.stringify(t).toLowerCase().includes("reddit"));
            console.log("Reddit tools:", redditTools.map((t: any) => t.name || t.id || t.slug));
        }
        
         // @ts-ignore
        if (composio.tools.getTools) {
             console.log("Calling tools.getTools()...");
             // @ts-ignore
            const tools = await composio.tools.getTools({ apps: ['reddit']});
             console.log("Tools found:", tools.map((t: any) => t.name || t.id));
        }

    } catch (e) {
        console.error("Error during inspection:", e);
    }
}

inspectComposio();

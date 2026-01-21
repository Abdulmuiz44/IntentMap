import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

// Try to import Action enum/object if it exists, or check exports
const core = require("@composio/core");

async function checkEnum() {
    console.log("Exports:", Object.keys(core));
    
    if (core.Action) {
        console.log("Action keys (sample):", Object.keys(core.Action).slice(0, 20));
        const redditActions = Object.keys(core.Action).filter(k => k.includes("REDDIT"));
        console.log("REDDIT Actions:", redditActions);
    }
}

checkEnum();
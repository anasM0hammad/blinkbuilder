import { getAccount, getAction } from "@/db";
import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, createPostResponse } from "@solana/actions";
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";

export const GET = async (req: Request) => {
    const urlToken = req.url.split('/');
    const hash = urlToken[urlToken.length - 1];

    const data = await getAction(hash);
    const action = JSON.parse(data.action);

    if(!action || !Object.keys(action).length){
        return Response.json('Blink Does not exists', {status: 400});
    }

    const payload: ActionGetResponse = {
        icon: new URL("https://blinkbuilder.onrender.com/logo.png").toString(),
        label: action.label,
        description: action.description,
        title: `${action.title} ${action.value}`,
    }

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
}

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    const body: ActionPostRequest = await req.json();
    let account: PublicKey;
    try{
        account = new PublicKey(body.account);
    }
    catch(err){
        return new Response('Invalid Account', {
            status: 400,
            headers: ACTIONS_CORS_HEADERS
        });
    }
    const urlToken = req.url.split('/');
    const hash = urlToken[urlToken.length - 1];
    const data = await getAction(hash);
    const action = JSON.parse(data.action);
    const userAccount = await getAccount(hash);
    const transaction = new Transaction();
    const instruction = SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: new PublicKey(userAccount.account),
        programId:SystemProgram.programId,
        lamports: +action.value,
    })
    const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 10000
    });
    transaction.add(priorityFeeInstruction, instruction);
    transaction.feePayer = account;
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const payload = await createPostResponse({
        fields: {
            transaction
        }
    })
    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS});
}
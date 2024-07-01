import { putData } from "@/db";
import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, ActionPostResponse, createPostResponse } from "@solana/actions";
import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";

const generateHashURL = (url: string): string => {
    const dateTime = new Date().toISOString();
    const salt = Math.random().toString(2).substring(2, 30);
    return new URL(`/api/blinks/${btoa(dateTime + salt)}`, new URL(url).origin).toString();
}

const getHashFromURL = (url: string): string => {
    const urlToken = url.split('/');
    return urlToken[urlToken.length - 1];
}

const getDetails = (data: string) => {
    const dataArr = data.split(',');
    const title = dataArr[0] ?? 'Blink';
    const description = dataArr[1] ?? 'Soalan Blink';
    const label = dataArr[2] ?? 'Pay';
    const value = dataArr[3] ?? '0';

    return {
        title,
        description,
        label,
        value
    };
}

export const GET = (req: Request) => {
    
    const payload: ActionGetResponse = {
        icon: new URL("https://blinkbuilder.onrender.com/logo.png").toString(),
        label: 'Get Your Blink!',
        description: `Provide Title, Description, Label & Price in comma seprated text.`,
        title: 'Build Your Blink for optional 14 cents',
        links: {
            actions: [
                {
                    label: 'Get Your Blink!',
                    href: `/api/build-blink?details={details}`,
                    parameters: [
                        {
                            name: 'details',
                            label: 'Enter Details'
                        }
                    ]
                }
                
            ]
        }
    }

    return Response.json(payload, {headers: ACTIONS_CORS_HEADERS});
}

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try{
        const randomHashURL = generateHashURL(new URL(req.url).origin.toString());
        const message = `Your Blink URL will be ${randomHashURL}`;
        const hash = getHashFromURL(randomHashURL);
        const details = new URLSearchParams(new URL(req.url).searchParams).get('details');
        const data = getDetails(details as string);
        data.value = (LAMPORTS_PER_SOL * +data.value).toString();

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
        await putData(hash, JSON.stringify(data), account.toString());
        const instruction = SystemProgram.transfer({
            fromPubkey: account,
            toPubkey: new PublicKey('XvH98VoFbdojwy6NvmpKCfu97s6zzHZQi2uepAX9fDT'),
            programId:SystemProgram.programId,
            lamports: 1000000,
        })
        const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 10000
        });
        const tx = new Transaction().add(priorityFeeInstruction, instruction);
        tx.feePayer = account;
        const connection = new Connection(clusterApiUrl('mainnet-beta'));
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        
        const payload = await createPostResponse({
            fields: {
                transaction: tx,
                message
            }
        })
        return Response.json(payload, { headers: ACTIONS_CORS_HEADERS});
    }
    catch(err){
        return Response.json('Unknown server error', { status: 400 });
    }
}
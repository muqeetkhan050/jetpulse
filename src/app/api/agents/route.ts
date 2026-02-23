import {NextResponse} from  "next/server";
import {connectDB} from '@/lib/db'
import {Agent} from '@/lib/models'


export async function POST(req:Request){
  const {planeId, ownerId,name, personality}=await req.json();

  await connectDB();
  const count =await Agent.countDocuments({planeId})
if (count>=10){
  return NextResponse.json({error:"Plane full (10 agents max)"},{status:400})
}
    const existing=await Agent.findOne({planeId,ownerId})
    if(existing){
      return NextResponse.json({error:"You already joined this flight"},{status:400})
    }

  const agent = await Agent.create({
    planeId,
    ownerId,
    name,
    personality,
  });

  return NextResponse.json(agent);
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const planeId = searchParams.get("planeId");

  await connectDB();

  const agents = await Agent.find({ planeId });

  return NextResponse.json(agents);
}
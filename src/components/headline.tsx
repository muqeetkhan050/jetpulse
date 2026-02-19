'use Client'

import { useFlights } from "@/hooks/useFlights"


interface HeadlineProps{
    children:React.ReactNode;
    className?:string;
}

export default function Headline({children, className}:HeadlineProps){
    return(
        <div className={`absolute top-4 left-4 bg-black/80 text-white p-4 rounded z-50 font-mono text-sm ${className || ''}`}>
            <h1 className="text-lg font-bold">Sydney Flight Tracker</h1>
            <p>Real-time 3D flight tracking for Sydney airports</p>
             {children && <div>{children}</div>}
        </div>
    )
}
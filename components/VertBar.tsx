interface VertBarProps {
    height?: string | null
}

export default function VertBar({height} : VertBarProps)
{
    return (<div className={(height?`h-${height}`: `h-32`) + `bg-white w-4`}></div>)
}
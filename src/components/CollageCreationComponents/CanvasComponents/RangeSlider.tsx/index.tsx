type RangeSliderProps =  {
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    label?: string;
    formatValue?: (value: number) => string;
};

export default function RangeSlider({
    min,
    max,
    step = 1,
    value,
    onChange,
    label,
    formatValue = (v) => String(v),
}: RangeSliderProps){
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div className="flex items-center gap-3 w-72">
            <input
                type="range"
                className="pin-range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-label={label}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ "--fill": `${percent}%` } as React.CSSProperties}
            />
            <span className="w-9 text-right text-sm font-semibold tabular-nums">
                {formatValue(value)}
            </span>
        </div>
    )
}
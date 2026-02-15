import { useEffect, useState, useRef } from 'react';

interface UseCounterAnimationOptions {
    duration?: number;
    easing?: (t: number) => number;
}

/**
 * Hook to animate number changes with smooth transitions
 * @param value - Target value to animate to
 * @param options - Animation configuration
 */
export const useCounterAnimation = (
    value: number,
    options: UseCounterAnimationOptions = {}
) => {
    const { duration = 300, easing = (t) => t * (2 - t) } = options; // Default easeOutQuad, 300ms
    const [displayValue, setDisplayValue] = useState(value);
    const rafRef = useRef<number>();
    const startTimeRef = useRef<number>();
    const startValueRef = useRef(value);

    useEffect(() => {
        if (startValueRef.current === value) {
            return;
        }

        const startValue = displayValue;
        const endValue = value;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);

            const currentValue = startValue + (endValue - startValue) * easedProgress;
            setDisplayValue(currentValue);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                // Ensure we end exactly at the target value
                setDisplayValue(endValue);
                startValueRef.current = endValue;
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [value, duration, easing, displayValue]);

    return displayValue;
};

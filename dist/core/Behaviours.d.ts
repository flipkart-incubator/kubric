export declare enum CLScrollEffect {
    NONE = 0,
    SCROLL = 1,
    FADE = 2,
    COLLAPSE = 4,
    FADE_OUT = 3
}
export interface CLScrollBehaviour {
    scrollEffect: CLScrollEffect;
    maxHeight: number;
    [key: string]: any;
}
export interface CLFadeBehaviour extends CLScrollBehaviour {
    minAlpha?: number;
}
export interface CLCollapseBehaviour extends CLScrollBehaviour {
    minHeight?: number;
}

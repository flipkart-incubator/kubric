export enum CLScrollEffect {
    NONE = 0,
    SCROLL = 1 << 0,
    FADE = 1 << 1,
    COLLAPSE = 1 << 2,

    FADE_OUT = SCROLL | FADE
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

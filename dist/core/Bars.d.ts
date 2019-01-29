import { ViewProperties, Animated, ViewStyle, ImageStyle, Insets, ImageURISource } from 'react-native';
import { CLScrollBehaviour } from './Behaviours';
import * as React from 'react';
export interface CLBarProps extends ViewProperties {
    safeAreaInsets?: Insets;
    scrollBehaviourOffset: Animated.AnimatedInterpolation;
    scrollBehaviours: CLScrollBehaviour[];
    contentRenderer: (index: number, scrollBehaviourOffset: Animated.AnimatedInterpolation) => React.ReactElement<any> | undefined | null;
    showSeparator?: boolean;
}
interface CLBarInterface {
    getDimensionRange: () => {
        minHeight: number;
        maxHeight: number;
    };
    getBehaviours: () => CLScrollBehaviour[];
}
interface CLBarState {
    maxHeight: number;
    minHeight: number;
    heightAnimatedValue: Animated.AnimatedInterpolation;
}
export declare class CLAppBar extends React.Component<CLBarProps, CLBarState> implements CLBarInterface {
    constructor(props: CLBarProps, context?: any);
    static getDerivedState<K extends keyof CLBarState>(nextProps: CLBarProps, _: Pick<CLBarState, K> | CLBarState | undefined): Pick<CLBarState, K> | CLBarState;
    getDimensionRange: () => {
        minHeight: number;
        maxHeight: number;
    };
    getBehaviours: () => CLScrollBehaviour[];
    shouldComponentUpdate(nextProps: Readonly<CLBarProps>, _nextState: Readonly<any>, _nextContext: any): boolean;
    componentWillReceiveProps(nextProps: CLBarProps, _nextContext: any): void;
    render(): React.ReactNode;
    protected containerStyle: () => ViewStyle;
    protected shadowImageSource: () => number | ImageURISource;
    protected separatorStyle: () => ImageStyle;
    protected renderItems: (scrollBehaviourOffset: Animated.AnimatedInterpolation) => React.ReactElement<any>[];
}
export declare class CLBottomBar extends CLAppBar {
    protected containerStyle: () => ViewStyle;
    protected shadowImageSource: () => number | ImageURISource;
    protected separatorStyle: () => ImageStyle;
    /**
     * V4TODO: There is a bug in bottom bar.
     * Item placement should be controlled with 'bottom' position instead of 'top' position.
     */
    protected renderItems: (scrollBehaviourOffset: Animated.AnimatedInterpolation) => React.ReactElement<any>[];
}
export {};

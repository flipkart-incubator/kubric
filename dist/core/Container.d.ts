import * as React from 'react';
import { Animated, LayoutChangeEvent, ScrollViewProperties, ViewProperties, Insets } from 'react-native';
import { CLBarProps } from './Bars';
import { CLScrollBehaviour } from './Behaviours';
export interface CLContainerProps extends ViewProperties {
    offset?: number;
    safeAreaInsets?: Insets;
    renderScrollComponent?: (props: ScrollViewProperties) => React.ReactElement<any>;
    renderBottomBar?: (props: CLBarProps) => React.ReactElement<CLBarProps>;
    renderAppBar?: (props: CLBarProps) => React.ReactElement<CLBarProps>;
    appBarScrollBehaviours?: CLScrollBehaviour[];
    bottomBarScrollBehaviours?: CLScrollBehaviour[];
    appBarContentRenderer?: (index: number, offset: Animated.AnimatedInterpolation) => React.ReactElement<any> | undefined | null;
    bottomBarContentRenderer?: (index: number, offset: Animated.AnimatedInterpolation) => React.ReactElement<any> | undefined | null;
    onProgress?: (offset: number, animatedInterpolation: Animated.AnimatedInterpolation, behaviourModel: BehaviourModel) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
}
export interface BehaviourModel {
    appBar: {
        minHeight: number;
        maxHeight: number;
    };
    bottomBar: {
        minHeight: number;
        maxHeight: number;
    };
}
export declare class CLContainer extends React.Component<CLContainerProps> {
    private _scrollDirection;
    private _scrollBehaviourOffset;
    private _scrollBehaviourOffsetAnimatedValue;
    private _lastOffsetY;
    private _minPaddingY;
    private _maxPaddingY;
    private _cummulativeDimensionRange;
    private _contentSize;
    private _scrollviewLayout;
    private _animating;
    constructor(props: CLContainerProps, context?: any);
    componentWillMount(): void;
    componentWillReceiveProps(nextProps: CLContainerProps, _nextContext: any): void;
    render(): React.ReactNode;
    /**
     * expandLayout
     * Use this method to reset the layout to beginning offset
     */
    expandLayout(): void;
    /**
     * collapseLayout
     * Use this method to apply full behaviour offset to bar i.e. collapse the bars
     */
    collapseLayout(): void;
    private _notifyProgress;
    private _setBehaviourOffset;
    private _onContentSizeChange;
    private _onScrollEndDrag;
    private _onMomentumScrollEnd;
    private _calculateBehaviour;
    private _calculateBehaviourForBar;
    private _finishTransition;
    private _animateToScrollBehaviourOffset;
    private _updateScrollBehavior;
    private _onScrollViewLayout;
    private _scrollListner;
}
/*************************** Experimental, Do NOT delete *****************************/

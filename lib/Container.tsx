import * as React from 'react';
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    LayoutRectangle,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollViewProperties,
    View,
    ViewProperties,
    Insets
} from 'react-native';
import { styles } from './resources/Styles';
import { CLAppBar, CLBarProps, CLBottomBar } from './Bars';
import { CLScrollBehaviour, CLScrollEffect } from './Behaviours';


export interface CLContainerProps extends ViewProperties {
    useNativeDriver?: boolean;
    offset?: number;
    safeAreaInsets?: Insets;
    renderScrollComponent?: (props: ScrollViewProperties) => React.ReactElement<any> | null;
    renderBottomBar?: (props: CLBarProps) => React.ReactElement<CLBarProps> | null;
    renderAppBar?: (props: CLBarProps) => React.ReactElement<CLBarProps> | null;
    appBarScrollBehaviours?: CLScrollBehaviour[];
    bottomBarScrollBehaviours?: CLScrollBehaviour[];
    appBarContentRenderer?: (index: number, offset: Animated.AnimatedInterpolation) => React.ReactElement<any> | undefined | null;
    bottomBarContentRenderer?: (index: number, offset: Animated.AnimatedInterpolation) => React.ReactElement<any> | undefined | null;

    onProgress?: (offset: number, animatedInterpolation: Animated.AnimatedInterpolation, CLBehaviourModel: CLBehaviourModel, direction: 'up' | 'down' | undefined) => void;
    onEnd?: (offset: number, animatedInterpolation: Animated.AnimatedInterpolation, CLBehaviourModel: CLBehaviourModel, direction: 'up' | 'down' | undefined) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
    showSeparator?: boolean;
}

export interface CLBehaviourModel {
    appBar: { minHeight: number; maxHeight: number };
    bottomBar: { minHeight: number; maxHeight: number };
}

const ANIMATION_DURATION = 300;
const MIN_ANIMATION_DURATION = 150;

export class CLContainer extends React.Component<CLContainerProps> {
    private _scrollDirection: 'up' | 'down' | undefined;
    private _scrollBehaviourOffset: number = 0;
    private _scrollBehaviourOffsetAnimatedValue: Animated.Value = new Animated.Value(0);
    private _lastOffsetY: number = 0;
    private _minPaddingY = 0;
    private _maxPaddingY = 0;
    private _cummulativeDimensionRange: CLBehaviourModel = {
        appBar: { minHeight: 0, maxHeight: 0 },
        bottomBar: { minHeight: 0, maxHeight: 0 }
    };
    private _contentSize: { width: number; height: number } = { width: 0, height: 0 };
    private _scrollviewLayout: LayoutRectangle = { x: 0, y: 0, width: 0, height: 0 };
    private _animating: boolean = false;

    constructor(props: CLContainerProps, context?: any) {
        super(props, context);
        this._cummulativeDimensionRange = this._calculateBehaviour(this.props);
    }

    public componentWillMount(): void {
        if (this.props.offset) {
            this._setBehaviourOffset(this.props.offset);
        }
    }

    public componentWillReceiveProps(nextProps: CLContainerProps, _nextContext: any): void {
        this._cummulativeDimensionRange = this._calculateBehaviour(nextProps);
        if (this.props.offset !== nextProps.offset) {
            this._setBehaviourOffset(nextProps.offset ? nextProps.offset : 0);
        }
    }

    public render(): React.ReactNode {
        const hasScroller = this.props.renderScrollComponent !== undefined;
        const hasAppBar = this.props.appBarScrollBehaviours && this.props.appBarScrollBehaviours.length > 0 && this.props.appBarContentRenderer !== undefined;
        const hasBottomBar = this.props.bottomBarScrollBehaviours && this.props.bottomBarScrollBehaviours.length > 0 && this.props.bottomBarContentRenderer !== undefined;
        const safeAreaInsets = this.props.safeAreaInsets ? this.props.safeAreaInsets : { top: 0, left: 0, bottom: 0, right: 0 };
        const showSeparator = !!this.props.showSeparator
        
        const paddingTop = hasAppBar ? 0 : safeAreaInsets.top;
        const paddingBottom = hasBottomBar ? 0 : safeAreaInsets.bottom;

        this._minPaddingY = this._cummulativeDimensionRange.appBar.minHeight + this._cummulativeDimensionRange.bottomBar.minHeight;
        this._maxPaddingY = this._cummulativeDimensionRange.appBar.maxHeight + this._cummulativeDimensionRange.bottomBar.maxHeight;

        const scrollBehvavioutOffsetInterpolation = this._scrollBehaviourOffsetAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp'
        });

        if (!hasScroller && !hasAppBar && !hasBottomBar) {
            return <View style={[styles.fill, this.props.style]} />;
        }

        return (
            <View style={[{ flex: 1, paddingBottom, paddingTop }, this.props.style]}>
                {this.props.renderScrollComponent
                    ? this.props.renderScrollComponent({
                        contentContainerStyle: { paddingTop: this._cummulativeDimensionRange.appBar.maxHeight, paddingBottom: this._cummulativeDimensionRange.bottomBar.minHeight },
                        style: { flex: 1 },
                        scrollEventThrottle: 16,
                        onScroll: this._maxPaddingY === this._minPaddingY ? undefined : this._scrollListner,
                        onScrollEndDrag: this._onScrollEndDrag,
                        onMomentumScrollEnd: this._onMomentumScrollEnd,
                        onContentSizeChange: this._onContentSizeChange,
                        onLayout: this._onScrollViewLayout
                    })
                    : undefined}

                {this.props.appBarContentRenderer && this.props.appBarScrollBehaviours !== undefined ? (
                    this.props.renderAppBar ? (
                        this.props.renderAppBar({
                            style: styles.header,
                            safeAreaInsets: { ...safeAreaInsets, bottom: 0 },
                            scrollBehaviourOffset: scrollBehvavioutOffsetInterpolation,
                            scrollBehaviours: this.props.appBarScrollBehaviours,
                            contentRenderer: this.props.appBarContentRenderer,
                            showSeparator: showSeparator
                        })
                    ) : (
                            <CLAppBar
                                style={styles.header}
                                safeAreaInsets={{ ...safeAreaInsets, bottom: 0 }}
                                scrollBehaviourOffset={scrollBehvavioutOffsetInterpolation}
                                scrollBehaviours={this.props.appBarScrollBehaviours}
                                contentRenderer={this.props.appBarContentRenderer}
                                showSeparator={showSeparator}
                            />
                        )
                ) : (
                        undefined
                    )}
                {this.props.bottomBarContentRenderer && this.props.bottomBarScrollBehaviours !== undefined ? (
                    this.props.renderBottomBar ? (
                        this.props.renderBottomBar({
                            style: styles.footer,
                            safeAreaInsets: { ...safeAreaInsets, top: 0 },
                            scrollBehaviourOffset: scrollBehvavioutOffsetInterpolation,
                            scrollBehaviours: this.props.bottomBarScrollBehaviours,
                            contentRenderer: this.props.bottomBarContentRenderer,
                            showSeparator: showSeparator
                        })
                    ) : (
                            <CLBottomBar
                                style={styles.footer}
                                safeAreaInsets={{ ...safeAreaInsets, top: 0 }}
                                scrollBehaviourOffset={scrollBehvavioutOffsetInterpolation}
                                scrollBehaviours={this.props.bottomBarScrollBehaviours}
                                contentRenderer={this.props.bottomBarContentRenderer}
                                showSeparator={showSeparator}
                            />
                        )
                ) : (
                        undefined
                    )}
            </View>
        );
    }

    /**
     * expandLayout
     * Use this method to reset the layout to beginning offset
     */
    public expandLayout(): void {
        this._animateToScrollBehaviourOffset(0, this._scrollBehaviourOffset, true);
    }

    /**
     * collapseLayout
     * Use this method to apply full behaviour offset to bar i.e. collapse the bars
     */
    public collapseLayout(): void {
        this._animateToScrollBehaviourOffset(1, this._scrollBehaviourOffset, true);
    }

    private _notifyProgress(): void {
        if (this.props.onProgress) {
            this.props.onProgress(this._scrollBehaviourOffset, this._scrollBehaviourOffsetAnimatedValue, this._cummulativeDimensionRange, this._scrollDirection);
        }
    }

    private _notifyEnd(): void {
        if (this.props.onEnd) {
            this.props.onEnd(this._scrollBehaviourOffset, this._scrollBehaviourOffsetAnimatedValue, this._cummulativeDimensionRange, this._scrollDirection);
        }
    }

    private _setBehaviourOffset(nextOffset: number): void {
        this._scrollBehaviourOffset = nextOffset > 1 ? 1 : nextOffset < 0 ? 0 : nextOffset;
        this._scrollBehaviourOffsetAnimatedValue.setValue(this._scrollBehaviourOffset);
        this._notifyProgress();
    }

    private _onContentSizeChange = (w: number, h: number) => {
        this._contentSize.width = w;
        this._contentSize.height = h;
    };

    private _onScrollEndDrag: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void = (event?: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nativeEvent: NativeScrollEvent | undefined = event && event.nativeEvent;
        if (nativeEvent && nativeEvent.velocity && nativeEvent.velocity.y !== 0) {
            return;
        }
        this._finishTransition();
    };

    private _onMomentumScrollEnd: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void = (event?: NativeSyntheticEvent<NativeScrollEvent>) => {
        const nativeEvent: NativeScrollEvent | undefined = event && event.nativeEvent;
        if (!nativeEvent || (nativeEvent && ((nativeEvent.velocity && nativeEvent.velocity.y === 0) || nativeEvent.velocity === undefined))) {
            this._finishTransition();
        }
    };

    private _calculateBehaviour: (newProps: CLContainerProps) => CLBehaviourModel = (newProps: CLContainerProps) => {
        const safeAreaInsets = newProps.safeAreaInsets ? newProps.safeAreaInsets : { top: 0, left: 0, bottom: 0, right: 0 };
        let cummulativeAppBarDimensionRange: { minHeight: number; maxHeight: number };
        let cummulativeBottomBarDimensionRange: { minHeight: number; maxHeight: number };

        const hasAppBar = newProps.appBarScrollBehaviours && newProps.appBarScrollBehaviours.length > 0 && newProps.appBarContentRenderer !== undefined;
        const hasBottomBar = newProps.bottomBarScrollBehaviours && newProps.bottomBarScrollBehaviours.length > 0 && newProps.bottomBarContentRenderer !== undefined;

        if (newProps.appBarScrollBehaviours) {
            cummulativeAppBarDimensionRange = this._calculateBehaviourForBar(newProps.appBarScrollBehaviours, { ...safeAreaInsets, bottom: 0, top: hasAppBar ? safeAreaInsets.top : 0 });
        } else {
            cummulativeAppBarDimensionRange = { minHeight: 0, maxHeight: 0 };
        }

        if (newProps.bottomBarScrollBehaviours) {
            cummulativeBottomBarDimensionRange = this._calculateBehaviourForBar(newProps.bottomBarScrollBehaviours, { ...safeAreaInsets, top: 0, bottom: hasBottomBar ? safeAreaInsets.bottom : 0 });
        } else {
            cummulativeBottomBarDimensionRange = { minHeight: 0, maxHeight: 0 };
        }

        return {
            appBar: {
                minHeight: cummulativeAppBarDimensionRange.minHeight,
                maxHeight: cummulativeAppBarDimensionRange.maxHeight
            },
            bottomBar: {
                minHeight: cummulativeBottomBarDimensionRange.minHeight,
                maxHeight: cummulativeBottomBarDimensionRange.maxHeight
            }
        };
    };

    private _calculateBehaviourForBar = (scrollBehaviours: CLScrollBehaviour[], safeAreaInsets?: Insets): { minHeight: number; maxHeight: number } => {
        const _deducedItemDimensionBehaviours = [];
        let minHeight = safeAreaInsets ? (safeAreaInsets.top || 0) + (safeAreaInsets.bottom || 0) : 0;
        let maxHeight = minHeight;

        for (const behaviour of scrollBehaviours) {
            const deducedDimensionRange: { minHeight: number; maxHeight: number } = { minHeight: 0, maxHeight: behaviour.maxHeight };

            if (behaviour.scrollEffect & CLScrollEffect.COLLAPSE) {
                deducedDimensionRange.minHeight = behaviour.minHeight;
            } else if ((behaviour.scrollEffect & CLScrollEffect.SCROLL) === CLScrollEffect.NONE) {
                deducedDimensionRange.minHeight = behaviour.maxHeight;
            }

            _deducedItemDimensionBehaviours.push(deducedDimensionRange);

            minHeight += deducedDimensionRange.minHeight;
            maxHeight += deducedDimensionRange.maxHeight;
        }
        return { minHeight, maxHeight };
    };

    private _finishTransition(): void {
        if (this._scrollBehaviourOffset === 0 || this._scrollBehaviourOffset === 1) {
            return;
        }

        let targetOffset: number;
        if (this._lastOffsetY < this._cummulativeDimensionRange.appBar.maxHeight) {
            targetOffset = 0;
        } else if (this._scrollDirection === 'up') {
            targetOffset = this._scrollBehaviourOffset < 0.1 ? 0 : 1;
        } else if (this._scrollDirection === 'down') {
            targetOffset = this._scrollBehaviourOffset > 0.9 ? 1 : 0;
        } else {
            targetOffset = this._scrollBehaviourOffset < 0.5 ? 0 : 1;
        }
        this._animateToScrollBehaviourOffset(targetOffset, this._scrollBehaviourOffset, true);
    }

    private _animateToScrollBehaviourOffset = (targetOffset: number, from?: number, animate?: boolean) => {
        if (animate) {
            if (this._animating) {
                return;
            }
            this._animating = true;

            const fromOffset = from ? from : targetOffset > 0.5 ? 1 : 0;
            const duration = Math.max((targetOffset > fromOffset ? 1 : -1) * (targetOffset - fromOffset) * ANIMATION_DURATION, MIN_ANIMATION_DURATION);
            Animated.timing(this._scrollBehaviourOffsetAnimatedValue, {
                toValue: targetOffset,
                duration,
                easing: Easing.ease,
                useNativeDriver: this.props.useNativeDriver
            }).start((_result: { finished: boolean }) => {
                this._scrollBehaviourOffset = targetOffset;
                this._animating = false;
                this._notifyProgress();
                this._notifyEnd()
            });
        }
    };

    private _updateScrollBehavior = (nextY: number): void => {
        const delta = (nextY - this._lastOffsetY) / (this._maxPaddingY - this._minPaddingY);
        this._scrollDirection = delta > 0 ? 'down' : delta < 0 ? 'up' : this._scrollDirection;
        const nextOffset = this._scrollBehaviourOffset + delta;
        this._setBehaviourOffset(nextOffset);
        this._lastOffsetY = nextY;
    };

    private _onScrollViewLayout = (event: LayoutChangeEvent): void => {
        if (this.props.onLayout) {
            this.props.onLayout(event);
        }
        const rectangle: LayoutRectangle = event.nativeEvent.layout;
        this._scrollviewLayout.width = rectangle.width;
        this._scrollviewLayout.height = rectangle.height;
    };

    private _scrollListner = (event?: NativeSyntheticEvent<NativeScrollEvent>): void => {
        if (this._animating) {
            return;
        }
        if (event) {
            const nextY: number = event.nativeEvent.contentOffset.y;
            const isOffsetWithinBounds = nextY + event.nativeEvent.layoutMeasurement.height <= event.nativeEvent.contentSize.height;
            const isContentHeightGreaterThanLayout = nextY > event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
            if (nextY < 0 || isContentHeightGreaterThanLayout || !isOffsetWithinBounds) {
                return;
            }
            this._updateScrollBehavior(nextY);
        }
    };
}

/*************************** Experimental, Do NOT delete *****************************/

// export interface BarContentProps extends ViewProperties {
//   scrollBehaviourOffset: Animated.AnimatedInterpolation;
//   scrollBehaviour: CLScrollBehaviour;
// }

// export abstract class BarContent extends React.Component<BarContentProps, any> {

//     getScrollBehaviour(): CLScrollBehaviour {
//         return this.props.scrollBehaviour;
//     }

//     abstract getDimensionBehaviour(): CLDimensionBehaviour;

//     abstract render(): JSX.Element;
// }

// export class BaseBarContent extends BarContent {
//     private _maxHeight: number = 0;
//     private _minHeight: number = 0;

//     constructor(props: BarContentProps) {
//         super(props);
//         this.getDimensionBehaviour = this.getDimensionBehaviour.bind(this);
//         this.getScrollBehaviour = this.getScrollBehaviour.bind(this);
//         this._maxHeight = 66;
//         if (this.props.scrollBehaviour | CLScrollBehaviour.SCROLL) {
//             this._minHeight = 0;
//         }
//     }

//     getDimensionBehaviour() {
//         return { maxHeight: this._maxHeight, minHeight: this._minHeight };
//     }

//     render() {
//         // debugger;
//         const height = this.props.scrollBehaviourOffset.interpolate({
//             inputRange: [0, 1],
//             outputRange: [this._maxHeight, this._minHeight],
//             extrapolate: 'clamp'
//         });
//         return (
//             <Animated.View style={[styles.barContent, { height: height }]} {...this.props}>
//                 <Text>BottomBarContent</Text>
//             </Animated.View>
//         );
//     }
// }

// }

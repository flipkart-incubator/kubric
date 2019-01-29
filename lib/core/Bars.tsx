import { ViewProperties, Animated, Image, View, ViewStyle, ImageStyle, Insets, ImageURISource, ImageRequireSource } from 'react-native';
import { CLScrollBehaviour, CLScrollEffect } from './Behaviours';
import * as React from 'react';
import { BOTTOM_SHADOW_IMAGE, TOP_SHADOW_IMAGE, SEPARATOR_HEIGHT, CLEAR_COLOR } from './resources/Constants';
import { styles } from './resources/Styles';

export interface CLBarProps extends ViewProperties {
    safeAreaInsets?: Insets;
    scrollBehaviourOffset: Animated.AnimatedInterpolation;
    scrollBehaviours: CLScrollBehaviour[];
    contentRenderer: (index: number, scrollBehaviourOffset: Animated.AnimatedInterpolation) => React.ReactElement<any> | undefined | null;
    showSeparator?: boolean;
}

interface CLBarInterface {
    getDimensionRange: () => { minHeight: number; maxHeight: number };
    getBehaviours: () => CLScrollBehaviour[];
}

interface CLBarState {
    maxHeight: number;
    minHeight: number;
    heightAnimatedValue: Animated.AnimatedInterpolation;
}

export class CLAppBar extends React.Component<CLBarProps, CLBarState> implements CLBarInterface {
    constructor(props: CLBarProps, context?: any) {
        super(props, context);
        this.state = CLAppBar.getDerivedState(props, undefined);
    }

    public static getDerivedState<K extends keyof CLBarState>(nextProps: CLBarProps, _: Pick<CLBarState, K> | CLBarState | undefined): Pick<CLBarState, K> | CLBarState {
        let minHeight = (nextProps.safeAreaInsets ? (nextProps.safeAreaInsets.top || 0) + (nextProps.safeAreaInsets.bottom || 0) : 0) + (nextProps.showSeparator ? SEPARATOR_HEIGHT : 0);
        let maxHeight = minHeight;

        for (const behaviour of nextProps.scrollBehaviours) {
            const deducedDimensionBehaviour: { minHeight: number; maxHeight: number } = { minHeight: 0, maxHeight: behaviour.maxHeight };

            if (behaviour.scrollEffect & CLScrollEffect.COLLAPSE) {
                deducedDimensionBehaviour.minHeight = behaviour.minHeight;
            } else if ((behaviour.scrollEffect & CLScrollEffect.SCROLL) === CLScrollEffect.NONE) {
                deducedDimensionBehaviour.minHeight = behaviour.maxHeight;
            }

            minHeight += deducedDimensionBehaviour.minHeight;
            maxHeight += deducedDimensionBehaviour.maxHeight;
        }

        const heightAnimatedValue = nextProps.scrollBehaviourOffset.interpolate({
            inputRange: [0, 1],
            outputRange: [maxHeight, minHeight],
            extrapolate: 'clamp'
        });

        return { minHeight, maxHeight, heightAnimatedValue };
    }

    public getDimensionRange: () => { minHeight: number; maxHeight: number } = () => {
        return { minHeight: this.state.minHeight, maxHeight: this.state.maxHeight };
    };

    public getBehaviours: () => CLScrollBehaviour[] = () => {
        return this.props.scrollBehaviours;
    };

    public shouldComponentUpdate(nextProps: Readonly<CLBarProps>, _nextState: Readonly<any>, _nextContext: any): boolean {
        return nextProps !== this.props;
    }

    public componentWillReceiveProps(nextProps: CLBarProps, _nextContext: any): void {
        this.setState(CLAppBar.getDerivedState(nextProps, this.state));
    }

    public render(): React.ReactNode {
        if (this.props.showSeparator) {
            const shadowImageSource = this.shadowImageSource();
            const containerStyle = this.containerStyle();
            const separatorStyle = this.separatorStyle();

            return (
                <Animated.View {...this.props} style={[this.props.style, { height: this.state.heightAnimatedValue, backgroundColor: CLEAR_COLOR }]}>
                    <View style={[this.props.style, containerStyle]}>{this.renderItems(this.props.scrollBehaviourOffset)}</View>
                    <Image style={separatorStyle} source={shadowImageSource } resizeMode={'stretch'} />
                </Animated.View>
            );
        } else {
            return (
                <Animated.View {...this.props} style={[this.props.style, { height: this.state.heightAnimatedValue }]}>
                    {this.renderItems(this.props.scrollBehaviourOffset)}
                </Animated.View>
            );
        }
    }

    protected containerStyle = (): ViewStyle => {
        return { bottom: SEPARATOR_HEIGHT };
    };

    protected shadowImageSource = (): ImageRequireSource | ImageURISource => {
        return require('./resources/assets/' + TOP_SHADOW_IMAGE);
    };

    protected separatorStyle = (): ImageStyle => {
        return styles.bottomShadow as ImageStyle;
    };

    protected renderItems = (scrollBehaviourOffset: Animated.AnimatedInterpolation): React.ReactElement<any>[] => {
        const children: React.ReactElement<any>[] = [];
        let index: number = 0;
        let topPosition: number = (this.props.safeAreaInsets && this.props.safeAreaInsets.top) || 0;

        let translateYOffset: Animated.AnimatedInterpolation = new Animated.Value(0);

        for (const scrollBehaviour of this.props.scrollBehaviours) {
            const content = this.props.contentRenderer(index, scrollBehaviourOffset);
            const itemMinHeight = this.props.scrollBehaviours[index].minHeight ? this.props.scrollBehaviours[index].minHeight : 0;
            const itemMaxHeight = this.props.scrollBehaviours[index].maxHeight;

            const alpha =
                scrollBehaviour.scrollEffect & CLScrollEffect.FADE
                    ? scrollBehaviourOffset.interpolate({
                          inputRange: [0, 0.5, 0.75],
                          outputRange: [1, 0.25, 0],
                          extrapolate: 'clamp'
                      })
                    : new Animated.Value(1);

            const itemTranslateY =
                scrollBehaviour.scrollEffect & CLScrollEffect.SCROLL
                    ? scrollBehaviourOffset.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, itemMinHeight - itemMaxHeight],
                          extrapolate: 'clamp'
                      })
                    : new Animated.Value(0);

            const height =
                scrollBehaviour.scrollEffect & CLScrollEffect.COLLAPSE
                    ? scrollBehaviourOffset.interpolate({
                          inputRange: [0, 1],
                          outputRange: [itemMaxHeight, itemMinHeight],
                          extrapolate: 'clamp'
                      })
                    : new Animated.Value(itemMaxHeight);

            const yOffsetFromHeight =
                scrollBehaviour.scrollEffect & CLScrollEffect.COLLAPSE
                    ? height.interpolate({
                          inputRange: [itemMinHeight, itemMaxHeight],
                          outputRange: [itemMinHeight - itemMaxHeight, 0],
                          extrapolate: 'clamp'
                      })
                    : new Animated.Value(0);

            const translateY = Animated.add(translateYOffset, itemTranslateY);
            translateYOffset = Animated.add(translateY, yOffsetFromHeight);

            const item = (
                <Animated.View
                    key={index}
                    style={{
                        position: 'absolute',
                        top: topPosition,
                        left: 0,
                        right: 0,
                        transform: [{ translateY }],
                        opacity: alpha,
                        height,
                        zIndex: -index,
                        overflow: 'hidden'
                    }}
                >
                    {content}
                </Animated.View>
            );

            children.push(item);

            topPosition += itemMaxHeight;
            index++;
        }

        return children;
    };
}

export class CLBottomBar extends CLAppBar {
    protected containerStyle = (): ViewStyle => {
        return { top: SEPARATOR_HEIGHT };
    };

    protected shadowImageSource = (): ImageRequireSource | ImageURISource => {
        return require('./resources/assets/' + BOTTOM_SHADOW_IMAGE);
    };

    protected separatorStyle = (): ImageStyle => {
        return styles.topShadow as ImageStyle;
    };

    /**
     * V4TODO: There is a bug in bottom bar.
     * Item placement should be controlled with 'bottom' position instead of 'top' position.
     */
    protected renderItems = (scrollBehaviourOffset: Animated.AnimatedInterpolation): React.ReactElement<any>[] => {
        const children: React.ReactElement<any>[] = [];
        let index: number = 0;
        let topPosition: number = (this.props.safeAreaInsets && this.props.safeAreaInsets.top) || 0;

        for (const scrollBehaviour of this.props.scrollBehaviours) {
            const content = this.props.contentRenderer(index, scrollBehaviourOffset);

            const itemMinHeight = this.props.scrollBehaviours[index].minHeight ? this.props.scrollBehaviours[index].minHeight : 0;
            const itemMaxHeight = this.props.scrollBehaviours[index].maxHeight;

            const alpha =
                scrollBehaviour.scrollEffect & CLScrollEffect.FADE
                    ? scrollBehaviourOffset.interpolate({
                          inputRange: [0, 0.5, 0.75],
                          outputRange: [1, 0.25, 0],
                          extrapolate: 'clamp'
                      })
                    : new Animated.Value(1);

            const height =
                scrollBehaviour.scrollEffect & CLScrollEffect.COLLAPSE
                    ? scrollBehaviourOffset.interpolate({
                          inputRange: [0, 1],
                          outputRange: [itemMaxHeight, itemMinHeight],
                          extrapolate: 'clamp'
                      })
                    : new Animated.Value(itemMaxHeight);

            const item = (
                <Animated.View
                    key={index}
                    style={{
                        position: 'absolute',
                        top: topPosition,
                        left: 0,
                        right: 0,
                        opacity: alpha,
                        height,
                        zIndex: index,
                        overflow: 'hidden'
                    }}
                >
                    {content}
                </Animated.View>
            );

            children.push(item);

            topPosition += itemMaxHeight;
            index++;
        }
        return children;
    };
}

import React from "react";
import {
    Circle,
    ClipPath,
    Defs,
    Ellipse,
    G,
    Line,
    LinearGradient,
    Path,
    Polygon,
    Polyline,
    RadialGradient,
    Rect,
    Stop,
    Svg,
    Text,
    SVGTextProps,
    Tspan,
    View
} from "@react-pdf/renderer";
import type { Transformer } from './types'
import { convertUnitValue } from "./utils";

const BaseNodeTransformer = (nodeName: string, transformer: Transformer): Transformer => {
    return (data) => {
        if (data.domNode.name != nodeName) return data.element;
        return transformer(data);
    }
}

export const UnitValueTransformer: Transformer = (data) => {

    if (!data.element) return data.element;

    const props = { ...data.element.props };

    if (props.style) {
        Object.entries(props.style).filter(([prop, value]) => value != null).forEach(([prop, value]) => {
            props.style[prop] = convertUnitValue(value as any, data.settings.baseFontSize);
        });
    }

    if (props.strokeDasharray) {
        props.strokeDasharray = convertUnitValue(props.strokeDasharray.split(' ')[0], data.settings.baseFontSize).toString();
    }
    if (data.domNode.name == 'tspan') {
        props.dx = convertUnitValue(props.dx || 0, data.settings.baseFontSize);
        props.dy = convertUnitValue(props.dy || 0, data.settings.baseFontSize);
    }

    return React.cloneElement(data.element, props, data.children);
}

export const DivTransformer = BaseNodeTransformer('div', (data) => <View {...data.element?.props} key={data.key}>{data.children}</View>);

export const ViewTransformer = BaseNodeTransformer('view', (data) => <View {...data.element?.props} key={data.key}>{data.children}</View>);

export const SvgTransformer = BaseNodeTransformer('svg', (data) => <Svg {...data.element?.props} key={data.key}>{data.children}</Svg>);

export const LineTransformer = BaseNodeTransformer('line', (data) => <Line {...data.element?.props} key={data.key}>{data.children}</Line>);

export const PolylineTransformer = BaseNodeTransformer('polyline', (data) => <Polyline {...data.element?.props} key={data.key}>{data.children}</Polyline>);

export const PolygonTransformer = BaseNodeTransformer('polygon', (data) => <Polygon {...data.element?.props} key={data.key}>{data.children}</Polygon>);

export const PathTransformer = BaseNodeTransformer('path', (data) => <Path {...data.element?.props} key={data.key}>{data.children}</Path>);

export const RectTransformer = BaseNodeTransformer('rect', (data) => <Rect {...data.element?.props} key={data.key}>{data.children}</Rect>);

export const CircleTransformer = BaseNodeTransformer('circle', (data) => <Circle {...data.element?.props} key={data.key}>{data.children}</Circle>);

export const EllipseTransformer = BaseNodeTransformer('ellipse', (data) => <Ellipse {...data.element?.props} key={data.key}>{data.children}</Ellipse>);

export const TextTransformer = BaseNodeTransformer('text', (data) => {
    const children = React.Children.map(data.children, child => {
        if (child?.type != 'TSPAN') return child;

        const coordinates: { x?: number; y?: number } = {};
        if (child.props.dx){
            coordinates.x = child.props.dx + Number.parseFloat(data.element?.props.x);
        }
        if (child.props.dy){
            coordinates.y = child.props.dy + Number.parseFloat(data.element?.props.y);
        }
        if (coordinates.x || coordinates.y) {
            return React.cloneElement(child, coordinates);
        }
        return child;
        // const x = child.props.dx ? child.props.dx + Number.parseFloat(data.element?.props.x) : child.props.x;
        // const y = child.props.dy ? child.props.dy + Number.parseFloat(data.element?.props.y) : child.props.y;

        // return React.cloneElement(child, { x, y });
    });

    const { props } = data.element!;
    const { x, y, style = {}, ...otherProps } = props as SVGTextProps;

    if (props.transform?.startsWith('rotate(')) {
        const mathes = props.transform.matchAll(new RegExp('[-.0-9]+', 'g'));
        const [rotate, posX = x, posY = y] = Array.from(mathes).map((value: any) => value[0]);
        
        //@ts-ignore
        style.transformOrigin = `${posX} ${posY}`;
    }
    
    return <Text x={x} y={y} style={style} {...otherProps} key={data.key}>{children}</Text>
});

export const TspanTransformer = BaseNodeTransformer('tspan', (data) => <Tspan {...data.element?.props} key={data.key}>{data.children}</Tspan>);

export const SpanTransformer = BaseNodeTransformer('span', (data) => <Text {...data.element?.props} key={data.key}>{data.children}</Text>);

export const TitleTransformer = BaseNodeTransformer('title', (data) => <Text {...data.element?.props} key={data.key}>{data.children}</Text>);

export const GTransformer = BaseNodeTransformer('g', (data) => <G {...data.element?.props} key={data.key}>{data.children}</G>);

export const StopTransformer = BaseNodeTransformer('stop', (data) => <Stop {...data.element?.props} key={data.key}>{data.children}</Stop>);

export const DefsTransformer = BaseNodeTransformer('defs', (data) => <Defs {...data.element?.props} key={data.key}>{data.children}</Defs>);

export const ClipPathTransformer = BaseNodeTransformer('clippath', (data) => <ClipPath {...data.element?.props} key={data.key}>{data.children}</ClipPath>);

export const LinearGradientTransformer = BaseNodeTransformer('lineargradient', (data) => <LinearGradient {...data.element?.props} key={data.key}>{data.children}</LinearGradient>);

export const RadialGradientTransformer = BaseNodeTransformer('radialgradient', (data) => <RadialGradient {...data.element?.props} key={data.key}>{data.children}</RadialGradient>);

export const UlTransformer = BaseNodeTransformer('ul', (data) => <View {...data.element?.props} key={data.key}>{data.children}</View>);

export const LiTransformer = BaseNodeTransformer('li', (data) => <View {...data.element?.props} key={data.key}>{data.children}</View>);

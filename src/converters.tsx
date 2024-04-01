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

export type INodeConverter = {
    nodeName: string;
    convert: (props: any, children: React.ReactElement | React.ReactElement[] | null) => React.ReactElement;
}

export const DivConverter: INodeConverter = {
    nodeName: 'div',
    convert: (props, children) => React.createElement(View, props, children)
}

export const ViewConverter: INodeConverter = {
    nodeName: 'view',
    convert: (props, children) => React.createElement(View, props, children)
}

export const SvgConverter: INodeConverter = {
    nodeName: 'svg',
    convert: (props, children) => React.createElement(Svg, props, children)
}

export const LineConverter: INodeConverter = {
    nodeName: 'line',
    convert: (props, children) => React.createElement(Line, props, children)
}

export const PolylineConverter: INodeConverter = {
    nodeName: 'polyline',
    convert: (props, children) => React.createElement(Polyline, props, children)
}

export const PolygonConverter: INodeConverter = {
    nodeName: 'polygon',
    convert: (props, children) => React.createElement(Polygon, props, children)
}

export const PathConverter: INodeConverter = {
    nodeName: 'path',
    convert: (props, children) => React.createElement(Path, props, children)
}

export const RectConverter: INodeConverter = {
    nodeName: 'rect',
    convert: (props, children) => React.createElement(Rect, props, children)
}

export const CircleConverter: INodeConverter = {
    nodeName: 'circle',
    convert: (props, children) => React.createElement(Circle, props, children)
}

export const EllipseConverter: INodeConverter = {
    nodeName: 'ellipse',
    convert: (props, children) => React.createElement(Ellipse, props, children)
}

export const TextConverter: INodeConverter = {
    nodeName: 'text',
    convert: (props, children) => {
        children = React.Children.map(children, child => {
            if (child?.type != 'TSPAN') return child;

            const coordinates: { x?: number; y?: number } = {};
            if (child.props.dx) {
                coordinates.x = child.props.dx + Number.parseFloat(props.x);
            }
            if (child.props.dy) {
                coordinates.y = child.props.dy + Number.parseFloat(props.y);
            }
            if (coordinates.x || coordinates.y) {
                return React.cloneElement(child, coordinates);
            }
            return child;
        });

        const { x, y, style = {}, ...otherProps } = props as SVGTextProps;

        if (props.transform?.startsWith('rotate(')) {
            const mathes = props.transform.matchAll(new RegExp('[-.0-9]+', 'g'));
            const [rotate, posX = x, posY = y] = Array.from(mathes).map((value: any) => value[0]);

            //@ts-ignore
            style.transformOrigin = `${posX} ${posY}`;
        }

        return <Text x={x} y={y} style={style} {...otherProps}>{children}</Text>
    }
}

export const TspanConverter: INodeConverter = {
    nodeName: 'tspan',
    convert: (props, children) => React.createElement(Tspan, props, children)
}

export const SpanConverter: INodeConverter = {
    nodeName: 'span',
    convert: (props, children) => React.createElement(Text, props, children)
}

export const TitleConverter: INodeConverter = {
    nodeName: 'title',
    convert: (props, children) => React.createElement(Text, props, children)
}

export const GConverter: INodeConverter = {
    nodeName: 'g',
    convert: (props, children) => React.createElement(G, props, children)
}

export const StopConverter: INodeConverter = {
    nodeName: 'stop',
    convert: (props, children) => React.createElement(Stop, props, children)
}

export const DefsConverter: INodeConverter = {
    nodeName: 'defs',
    convert: (props, children) => React.createElement(Defs, props, children)
}

export const ClipPathConverter: INodeConverter = {
    nodeName: 'clippath',
    convert: (props, children) => React.createElement(ClipPath, props, children)
}

export const LinearGradientConverter: INodeConverter = {
    nodeName: 'lineargradient',
    convert: (props, children) => React.createElement(LinearGradient, props, children)
}

export const RadialGradientConverter: INodeConverter = {
    nodeName: 'radialgradient',
    convert: (props, children) => React.createElement(RadialGradient, props, children)
}

export const UlConverter: INodeConverter = {
    nodeName: 'ul',
    convert: (props, children) => React.createElement(View, props, children)
}

export const LiConverter: INodeConverter = {
    nodeName: 'li',
    convert: (props, children) => React.createElement(View, props, children)
}

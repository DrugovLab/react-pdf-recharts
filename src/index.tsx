import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server';
import { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { ElementType } from 'domelementtype'
import htmlToDOM from 'html-dom-parser';
import CSSselect from 'css-select'
import deepmerge from 'deepmerge';
import {
    Circle,
    CircleProps,
    ClipPath,
    ClipPathProps,
    Defs,
    DefsProps,
    Ellipse,
    EllipseProps,
    G,
    GProps,
    Line,
    LinearGradient,
    LinearGradientProps,
    LineProps,
    Path,
    PathProps,
    Polygon,
    PolygonProps,
    Polyline,
    PolylineProps,
    RadialGradient,
    RadialGradientProps,
    Rect,
    RectProps,
    Stop,
    StopProps,
    Svg,
    SVGProps,
    SVGTextProps,
    Text,
    Tspan,
    TspanProps,
    View,
    ViewProps
} from "@react-pdf/renderer";

import type { Style } from '@react-pdf/types'

export type ElementProps = ViewProps | SVGProps | LineProps | PolylineProps | PolygonProps | PathProps | RectProps |
    CircleProps | EllipseProps | SVGTextProps | TspanProps | GProps | StopProps | DefsProps |
    ClipPathProps | LinearGradientProps | RadialGradientProps;

export type PropsUpdateQuery = {
    [selector: string]: ElementProps | ((props: ElementProps) => ElementProps);
}

export type StyleUpdateQuery = {
    [selector: string]: Style | ((props: ElementProps) => Style)
}

export type SvgWrapperProps = React.PropsWithChildren<{
    rechartResponsive?: boolean;
    baseFontSize?: number;
    propsUpdateQuery?: PropsUpdateQuery;
    styleUpdateQuery?: StyleUpdateQuery;
}>

const typeMapping: { [typeName: string]: React.ElementType } = {
    div: View,
    view: View,
    svg: Svg,
    line: Line,
    polyline: Polyline,
    polygon: Polygon,
    path: Path,
    rect: Rect,
    circle: Circle,
    ellipse: Ellipse,
    text: Text,
    tspan: Tspan,
    span: Text,
    title: Text,
    g: G,
    stop: Stop,
    defs: Defs,
    clippath: ClipPath,
    lineargradient: LinearGradient,
    radialgradient: RadialGradient,
    ul: View,
    li: View
}

function convertUnitValue(value: string | number, fontSize: number) {
    const stringValue = value.toString();
    if (stringValue.endsWith('rem')) {
        return Number.parseFloat(stringValue.split('rem')[0]) * fontSize;
    }
    if (stringValue.endsWith('em')) {
        return Number.parseFloat(stringValue.split('em')[0]) * fontSize;
    }
    return value;
}

export default function SvgWrapper(props: SvgWrapperProps) {

    const {
        rechartResponsive = true,
        baseFontSize = 11,
        propsUpdateQuery: elementProps = {},
        styleUpdateQuery: elementStyles = {}
    } = props;

    let html = renderToStaticMarkup(props.children);

    const dom = htmlToDOM(html, { lowerCaseAttributeNames: false });

    const defaultElementStyles: StyleUpdateQuery = {
        'tspan, text, span': {
            fontSize: baseFontSize
        },
        '.recharts-legend-wrapper': {
            position: undefined,
            width: undefined,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
        },
        '.recharts-default-legend': {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 8,
        },
        '.recharts-legend-item': {
            flexDirection: 'row',
            gap: 4
        },
    }

    if (rechartResponsive) {
        defaultElementStyles['.recharts-wrapper, .recharts-wrapper > svg'] = {
            width: '100%',
            height: 'auto'
        }
    }

    const updatePropsQueries = Object.entries(elementProps).concat(
        Object.entries(defaultElementStyles)
            .concat(Object.entries(elementStyles))
            .map(([selector, style]) => ([selector, { style }]))
    );

    const nodeAdditionalProps = updatePropsQueries.flatMap(([selector, newProps]) =>
        CSSselect(selector, dom).map(node => ({
            node,
            additionalPropsGetter: (currentProps: any) => {
                if (typeof newProps === 'function') {
                    return newProps(currentProps);
                }
                return newProps;
            }
        }))
    );

    const parserOptions: HTMLReactParserOptions = {

        transform(reactNode: any, domNode, index) {

            switch (domNode.type) {
                case ElementType.Text:
                    return domNode.data;
                case ElementType.Tag:

                    const elementType = typeMapping[domNode.name];
                    if (!elementType) return null;

                    let { children, ...props } = reactNode.props;
                    
                    props.key = props.key || reactNode.key || index;

                    const fontSize = props.style?.fontSize || baseFontSize;
                    if (props.style) {
                        Object.entries(props.style)
                            .filter(([prop, value]) => value != null)
                            .forEach(([prop, value]) => {
                                props.style[prop] = convertUnitValue(value as any, fontSize);
                            });
                    }
                    if (props.strokeDasharray) {
                        props.strokeDasharray = props.strokeDasharray.split(' ').join(', ');
                    }
                    if (domNode.name == 'tspan') {
                        props.dx = convertUnitValue(props.dx || 0, fontSize);
                        props.dy = convertUnitValue(props.dy || 0, fontSize);
                    }
                    if (domNode.name == 'text') {
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

                        if (props.transform?.startsWith('rotate(')) {
                            const mathes = props.transform.matchAll(new RegExp('[-.0-9]+', 'g'));
                            const [rotate, posX = props.x, posY = props.y] = Array.from(mathes).map((value: any) => value[0]);
                
                            if (!props.style) props.style = {};
                            props.style.transformOrigin = `${posX} ${posY}`;
                        }
                    }

                    nodeAdditionalProps.filter(x => x.node == domNode).forEach(({ additionalPropsGetter }) => {
                        props = deepmerge(props, additionalPropsGetter(props));
                    });
                    return React.createElement(elementType, props, children);

                default:
                    return null;
            }
        }
    };

    return domToReact(dom, parserOptions);
}
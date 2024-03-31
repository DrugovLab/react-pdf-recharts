import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server';
import HTMLReactParser, { HTMLReactParserOptions } from 'html-react-parser'
import { ElementType } from 'domelementtype'
import { SvgWrapperProps, StyleUpdateQuery, Transformer, TransformerData } from './types';
import {
    CircleTransformer,
    ClipPathTransformer,
    DefsTransformer,
    DivTransformer,
    EllipseTransformer,
    GTransformer,
    LiTransformer,
    LineTransformer,
    LinearGradientTransformer,
    PathTransformer,
    PolylineTransformer,
    PolygonTransformer,
    RadialGradientTransformer,
    RectTransformer,
    SpanTransformer,
    StopTransformer,
    SvgTransformer,
    TextTransformer,
    TspanTransformer,
    UlTransformer,
    UnitValueTransformer,
    ViewTransformer
} from './transformers';
import { updateProperties } from './utils';

const transformers: Transformer[] = [
    UnitValueTransformer,
    DivTransformer,
    ViewTransformer,
    SvgTransformer,
    LineTransformer,
    PolylineTransformer,
    PolygonTransformer,
    PathTransformer,
    RectTransformer,
    CircleTransformer,
    EllipseTransformer,
    TextTransformer,
    TspanTransformer,
    SpanTransformer,
    // TitleTransformer,
    GTransformer,
    StopTransformer,
    DefsTransformer,
    ClipPathTransformer,
    LinearGradientTransformer,
    RadialGradientTransformer,
    UlTransformer,
    LiTransformer,
];

export default function SvgWrapper(props: SvgWrapperProps) {

    const {
        reachartResponsive = true,
        baseFontSize = 11,
        propsUpdateQuery: elementProps = {},
        styleUpdateQuery: elementStyles = {}
    } = props;

    let html = renderToStaticMarkup(props.children);

    const parserOptions: HTMLReactParserOptions = {

        transform(reactNode: any, domNode, index) {

            switch (domNode.type) {
                case ElementType.Text:
                    return domNode.data;
                case ElementType.Tag:
                    const element = reactNode as React.ReactElement;
                    const data: TransformerData = {
                        element,
                        children: element.props.children,
                        domNode,
                        index,
                        key: element.key || index.toString(),
                        settings: {
                            baseFontSize
                        }
                    }
                    for (const transformer of transformers) {
                        data.element = transformer(data);
                        data.children = data.element?.props?.children;
                    }
                    const transformed = data.element != null && data.element.type != reactNode.type;
                    return transformed ? data.element : null;

                default:
                    return null;
            }
        }
    };

    let svgElement = HTMLReactParser(html, parserOptions);

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

    if (reachartResponsive) {
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

    updatePropsQueries.forEach(([selector, props]) => {
        svgElement = updateProperties(svgElement, selector, props);
    });

    return svgElement;
}
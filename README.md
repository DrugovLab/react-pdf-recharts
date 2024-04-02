
# react-pdf-svg

Wrapper component for rendering SVG in PDF files created via react-pdf on the browser and server

## How to install

```sh
yarn add react-pdf-svg
```

## How it works

```jsx
import React from 'react';
import { Document, Page } from '@react-pdf/renderer';
import SvgWrapper from 'react-pdf-svg'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';

const data = [
    {
        name: 'Page A',
        uv: 590,
        pv: 800,
        amt: 1400,
        cnt: 490,
    },
    {
        name: 'Page B',
        uv: 868,
        pv: 967,
        amt: 1506,
        cnt: 590,
    },
    {
        name: 'Page C',
        uv: 1397,
        pv: 1098,
        amt: 989,
        cnt: 350,
    },
    {
        name: 'Page D',
        uv: 1480,
        pv: 1200,
        amt: 1228,
        cnt: 480,
    },
    {
        name: 'Page E',
        uv: 1520,
        pv: 1108,
        amt: 1100,
        cnt: 460,
    },
    {
        name: 'Page F',
        uv: 1400,
        pv: 680,
        amt: 1700,
        cnt: 380,
    },
];

const MyDocument = () => (
    <Document>
        <Page size="A4" style={styles.page}>
            <SvgWrapper baseFontSize={9}>
                <LineChart width={500} height={300} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Legend />
                    <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" strokeDasharray="3 2 5" />
                </LineChart>
            </SvgWrapper>
        </Page>
    </Document>
);
```


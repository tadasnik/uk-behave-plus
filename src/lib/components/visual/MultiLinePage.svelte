<script>
  import { LayerCake, Svg, Html, groupLonger, flatten } from "layercake";

  import { scaleOrdinal } from "d3-scale";
  import { timeParse, timeFormat } from "d3-time-format";
  import { format, precisionFixed } from "d3-format";

  import MultiLine from "$lib/components/visual/MultiLine.svelte";
  import AxisX from "$lib/components/visual/AxisX.svelte";
  import AxisY from "$lib/components/visual/AxisY.svelte";
  import Labels from "$lib/components/visual/GroupLabels.html.svelte";
  import ScatterSvg from "./ScatterSvg.svelte";
  import SharedTooltip from "$lib/components/visual/SharedTooltip.html.svelte";

  // This example loads csv data as json using @rollup/plugin-dsv
  // import data from "./fruit.csv";

  export let data;
  export let xKey;
  export let yKey;
  export let zKey;
  /* --------------------------------------------
   * Set what is our x key to separate it from the other series
   */
  // const xKey = "month";
  // const yKey = "value";
  // const zKey = "fruit";

  // const xKeyCast = timeParse("%Y-%m-%d");

  // const seriesNames = Object.keys(data[0]).filter((d) => d !== xKey);
  const seriesColors = ["#ffe4b8", "#ffb3c0", "#ff7ac7", "#ff00cc"];

  /* --------------------------------------------
   * Cast values
   */
  // data.forEach((d) => {
  //   d[xKey] = typeof d[xKey] === "string" ? xKeyCast(d[xKey]) : d[xKey];
  //
  //   seriesNames.forEach((name) => {
  //     d[name] = +d[name];
  //   });
  // });

  const formatTickX = timeFormat("%b. %e");
  // const formatTickY = (d) => format(`.${precisionFixed(d)}s`)(d);

  // const groupedData = groupLonger(data, seriesNames, {
  //   groupTo: zKey,
  //   valueTo: yKey,
  // });
  console.log("data ", data);
</script>

<div class="chart-container">
  <LayerCake
    padding={{ top: 7, right: 10, bottom: 20, left: 25 }}
    x={xKey}
    y={yKey}
    z={zKey}
    zScale={scaleOrdinal()}
    zRange={seriesColors}
    flatData={flatten(data, "values")}
    {data}
  >
    <Svg>
      <AxisX gridlines={false} ticks={4} snapTicks={true} tickMarks={true} />
      <AxisY ticks={4} />
      <MultiLine />
      <!-- <ScatterSvg /> -->
    </Svg>

    <!-- <Html> -->
    <!--   <Labels /> -->
    <!--   <SharedTooltip formatTitle={formatTickX} dataset={data} /> -->
    <!-- </Html> -->
  </LayerCake>
</div>

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
  */
  .chart-container {
    width: 100%;
    height: 250px;
  }
</style>

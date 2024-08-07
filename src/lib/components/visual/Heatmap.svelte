<script>
  import { LayerCake, Svg, Html, groupLonger, flatten } from "layercake";
  import { scaleBand } from "d3-scale";
  import {
    scaleOrdinal,
    scaleTime,
    scaleQuantize,
    scaleSequential,
    scaleLinear,
  } from "d3-scale";
  import {
    interpolatePuOr,
    interpolateYlOrRd,
    interpolateReds,
    interpolateBlues,
    interpolateInferno,
    interpolateRdYlGn,
  } from "d3-scale-chromatic";
  import { timeParse, timeFormat } from "d3-time-format";

  import { outputNodes } from "$lib/data/outputNodes.js";
  import { _maxVal, selectedOutput } from "$lib/shared/stores/modelStore";
  import { currentTimeIndex } from "$lib/shared/stores/forecastStore";

  import Heatmap from "$lib/components/visual/HeatmapInner.svelte";
  import HeatmapAnotate from "$lib/components/visual/HeatmapAnotate.html.svelte";
  import AxisX from "$lib/components/visual/AxisX.svelte";
  import AxisY from "$lib/components/visual/AxisY.svelte";
  import AxisXTop from "$lib/components/visual/AxisXTop.html.svelte";
  import GroupLabels from "./GroupLabels.html.svelte";
  import HeatmapWindDir from "$lib/components/visual/HeatmapWindDir.html.svelte";
  import MultiSelect from "../ui/MultiSelect.svelte";

  export let fireBehaviourData;
  export let forecastData;
  export let xKey;
  export let yKey;
  export let zKey;
  const scaleTemp = scaleSequential(interpolatePuOr).domain([5, 30]);
  const scaleHum = scaleSequential(interpolatePuOr).domain([99, 30]);
  const scalePrec = scaleSequential(interpolateBlues).domain([0, 2]);
  const scaleWind = scaleSequential(interpolateRdYlGn).domain([10, 0]);
  const scaleProb = scaleSequential(interpolateRdYlGn).domain([30, 0]);

  const weatherProps = {
    Temperature: [
      "screenTemperature",
      "wi wi-thermometer",
      scaleTemp,
      0,
      "Temp. (C)",
    ],
    "Relative Humidity": [
      "screenRelativeHumidity",
      "wi wi-humidity",
      scaleHum,
      0,
      "Rel. Hum. (%)",
    ],
    Precipitation: [
      "totalPrecipAmount",
      "wi wi-rain",
      scalePrec,
      1,
      "Rain (mm)",
    ],
    "Wind Speed at 10m": [
      "windSpeed10m",
      "wi wi-windy",
      scaleWind,
      0,
      "Wind (m/s)",
    ],
    "Wind Gust Speed at 10m": [
      "windGustSpeed10m",
      "wi wi-strong-wind",
      scaleWind,
      0,
      "Wind gust (m/s)",
    ],
    "Wind From": [
      "windDirectionFrom10m",
      "wi wi-wind-direction",
      scaleTemp,
      0,
      "Wind dir.",
    ],
  };
  const commonOutputProps = {
    DeadFuelMoisture1hr: [
      "site.moisture.dead.tl1h",
      "wi wi-water",
      scaleProb,
      0,
    ],
    ignitionProbability: [
      "ignition.firebrand.probability",
      "wi wi-fire",
      scaleProb,
      0,
    ],
  };

  function isCommonOutput(output) {
    console.log("output", output);
    return Object.values(commonOutputProps)
      .map((values) => values[0])
      .includes(output);
  }

  // $: selectedTimeIndex = () => {
  // return d == $dateTime ? "font-bold text-primary-500" : "";
  // };

  $: seriesNames = Object.keys(fireBehaviourData[0]).filter((d) => d !== xKey);
  $: groupedData = groupLonger(fireBehaviourData, seriesNames, {
    groupTo: yKey,
    valueTo: zKey,
  });

  function formatTickXLong(tick) {
    let format = timeFormat("%H");
    let longFormat = timeFormat("%a");
    if (format(tick) === "00") {
      return longFormat(tick);
    } else {
      return format(tick);
    }
  }
  const formatTickX = timeFormat("%H");
  const leftMargin = 100;
  const topMargin = 35;
  const bottomMargin = 20;
  const cellSize = 25;
  const gapSize = 1.5;
  $: fuelsTicks = Object.keys(fireBehaviourData[0]);
  // $: yCount = Object.keys(fireBehaviourData[0]).length - 1;
  $: yCountWeather = Object.keys(weatherProps).length;
  $: yCount = Object.keys(fireBehaviourData[0]).length;
  $: chartHeight = (yCountWeather + yCount) * cellSize + cellSize;
  $: heatmapWidth = fireBehaviourData.length * cellSize;
  $: console.log("current timeIndex", $currentTimeIndex);
  // $: console.log("chartHeight", chartHeight, yCount, yCountWeather);
  // $: console.log("grouped data", groupedData);
</script>

<div
  class="flex relative"
  style="height:{topMargin +
    chartHeight +
    bottomMargin}px; width:{heatmapWidth + leftMargin}px"
>
  <div
    class="flex sticky
    left-0 bg-gray-100 z-10 justify-end"
    style="height:{topMargin +
      chartHeight +
      bottomMargin}px; width:{leftMargin}px"
  >
    <LayerCake
      padding={{ top: topMargin, right: 0, bottom: bottomMargin, left: 0 }}
      y={yKey}
      data={groupedData}
    >
      <Html>
        <!-- <Annotations {annotations} /> -->
        <HeatmapAnotate
          {cellSize}
          {gapSize}
          {forecastData}
          {weatherProps}
          axisLabel={outputNodes[$selectedOutput].label +
            " (" +
            outputNodes[$selectedOutput].units +
            ")"}
          commonOutput={isCommonOutput($selectedOutput)}
          {leftMargin}
        />
      </Html>
    </LayerCake>
  </div>
  <div
    class="flex-initial xcontainer z-0"
    style="height:{topMargin +
      chartHeight +
      bottomMargin}px; width:{heatmapWidth}px"
  >
    <LayerCake
      padding={{ top: topMargin, right: 0, bottom: bottomMargin, left: 0 }}
      x={xKey}
      y={yKey}
      z={zKey}
      xScale={scaleBand()}
      yScale={scaleBand()}
      zScale={scaleSequential(interpolateReds)}
      zDomain={[0, $_maxVal]}
      data={groupedData}
      flatData={flatten(groupedData, "values")}
    >
      <Svg>
        <!-- <AxisX -->
        <!--   gridlines={false} -->
        <!--   tickMarks={true} -->
        <!--   formatTick={formatTickXLong} -->
        <!-- /> -->
        <Heatmap
          {cellSize}
          {gapSize}
          {forecastData}
          {weatherProps}
          {commonOutputProps}
          halfPoint={$_maxVal / 2}
        />
      </Svg>
      <Html>
        <AxisXTop format={formatTickXLong} />
        <HeatmapWindDir {cellSize} {forecastData} />
      </Html>
    </LayerCake>
  </div>
</div>

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
    The width is being set inline below.
  */
  .xcontainer {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
  .xcontainer::-webkit-scrollbar {
    /* WebKit */
    width: 0px;
  }
</style>

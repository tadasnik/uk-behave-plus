<!--
  @component
  Generates an SVG bar chart.
 -->
<script>
  import { onMount, getContext } from "svelte";

  import {
    getFuelsImages,
    getFuelsFileNames,
  } from "$lib/firebase/firebase.client";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  const images = import.meta.glob(["$lib/assets/bars-background/**.webp"], {
    eager: true,
    as: "url",
  });
  const { data, xGet, yGet, xScale, yScale, xRange } = getContext("LayerCake");

  const xDomain = [0, 100];
</script>

<g class="bar-group">
  {#each $data as d, i}
    <defs>
      <pattern
        id={i}
        x={$xScale.range()[0]}
        y={$yGet(d.values[0])}
        patternUnits="userSpaceOnUse"
        width={$xGet(d.values[0])}
        height={$yScale.bandwidth()}
      >
        <image
          xlink:href={images[
            "/src/lib/assets/bars-background/" +
              UKFuelModels[d["surface.primary.fuel.model.catalogKey"]].photo
          ]}
          y={-$yScale.bandwidth() * 2}
        />
      </pattern>
    </defs>

    <rect
      class="group-rect"
      id={"rect-" + i}
      data-id={i}
      x={$xScale.range()[0]}
      y={$yGet(d.values[0])}
      height={$yScale.bandwidth()}
      width={$xGet(d.values[0]) === 0 ? 1 : $xGet(d.values[0])}
      fill="url(#{i})"
      stroke-width="1"
      stroke="grey"
    />
  {/each}
</g>

<script>
  import { getContext } from "svelte";
  import { Popover, Modal, Gallery, Button } from "flowbite-svelte";
  import {
    getFuelsImages,
    getFuelModelsFileNames,
  } from "$lib/firebase/firebase.client";

  import {
    selectedFuel,
    selectedOutput,
  } from "$lib/shared/stores/modelStore.js";
  import UKFuelModels from "$lib/data/UKFuelModels.json";
  import FuelModelModal from "$lib/components/visual/FuelModal.svelte";
  import { Html } from "layercake";
  const { data, xGet, y, yGet, percentRange } = getContext("LayerCake");

  /** @type {Array} annotations - A list of annotation objects. */
  export let weatherProps;

  /** @type {number} cellSize - heatmap cell size in px */
  export let cellSize;

  /** @type {number} gapSize - gap between weather and fire behaviour heatmaps
   * in units of cellSize. */
  export let gapSize;

  export let forecastData;

  /** @type {string} Selectede fire behaviour, y axis label. */
  export let axisLabel;

  /** @type {string} Forecast model. */
  export let forecastLabel;

  /** @type {boolean} Selecteded fire behaviour output type (per fuel or common
   * to all fuels). */
  export let commonOutput;

  /** @type {number} leftMargin - annotation (y axis) element width in px. */
  export let leftMargin;

  /** @type {number} topMargin - annotation (y axis) element width in px. */
  export let topMargin;

  function twoCharsBold(textToBold) {
    const chars = textToBold.split("");
    let bold = `<b>${chars[0]}${chars[1]}</b>`;
    if (chars.length > 2) {
      bold += chars.slice(2).join("");
    }
    console.log("bold", bold);
    return bold;
  }

  let clickOutsideModal = false;

  function handleFuelClick(fuelObject) {
    $selectedFuel = $y(fuelObject);
    // console.log("selected fuel", $selectedFuel);
    // console.log("clickOutsideModal parrent was", clickOutsideModal);
    clickOutsideModal = !clickOutsideModal;
    // console.log("clickOutsideModal parrent", clickOutsideModal);
  }
</script>

<div
  class="flex absolute columns-2 items-end min-w-96"
  style:top="-{topMargin}px"
  style:height={cellSize + "px"}
>
  <div class="w-[{leftMargin}px]" />
  <div class="pl-2 text-xl">
    {forecastLabel}
  </div>
</div>

{#each Object.values(weatherProps) as prop, i}
  <div
    class="flex justify-end overflow text-right items-center"
    style:left={cellSize / 2 + "px"}
    style:top={cellSize * i + "px"}
    style:height={cellSize + "px"}
  >
    <!-- <i class="text-xl {prop[1]} hover:text-primary-900" /> -->
    <div class="text-xs hover:text-primary-900 pr-1" id={"is" + i}>
      {prop[5]}
    </div>
  </div>
  <Popover
    class="w-64 text-sm font-light relative"
    arrow={false}
    title=""
    placement="right"
    offset={20}
    triggeredBy={"#" + "is" + i}>{prop[0]}</Popover
  >
{/each}

<div
  class="flex columns-2 items-end min-w-96"
  style:height={cellSize * gapSize + "px"}
>
  <div class="w-[{leftMargin}px]" />
  <div class="pl-2 text-xl">
    {axisLabel}
  </div>
</div>
<div class="flex justify-end">
  {#if !commonOutput}
    <div class="label-vertical text-base" style:width="35px">Fuel model</div>
  {/if}
  <div class="text-right justify-end pr-2 pl-2">
    {#each $data as fuelObject, i}
      <div
        class="flex justify-end overflow align-middle"
        role="button"
        on:click={() => handleFuelClick(fuelObject)}
        data-id={i}
        style:left={cellSize / 2 + "px"}
        style:top={cellSize * i + "px"}
        style:height={cellSize + "px"}
      >
        <div class="hover:text-primary-900">
          {#if $y(fuelObject) !== "All fuels"}
            {@html twoCharsBold($y(fuelObject))}
          {:else}
            {$y(fuelObject)}
          {/if}
        </div>
      </div>
      <!-- <Popover -->
      <!--   class="w-64 text-sm font-light relative" -->
      <!--   arrow={false} -->
      <!--   title="" -->
      <!--   placement="right" -->
      <!--   offset={20} -->
      <!--   triggeredBy={"#" + "is" + i}>{prop[0]}</Popover -->
      <!-- > -->
    {/each}
    {#if clickOutsideModal}
      <FuelModelModal bind:clickOutsideModal />
    {/if}
  </div>
</div>

<style>
  .label-vertical {
    display: inline-block;
    writing-mode: vertical-lr;
    transform: scale(-1);
    text-align: center;
  }
</style>

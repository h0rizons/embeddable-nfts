import { LitElement, html, customElement, property, css } from 'lit-element'
import { styleMap } from 'lit-html/directives/style-map'
import { classMap } from 'lit-html/directives/class-map'
import {OpenSeaTraitStats} from 'opensea-js/lib/types'

enum TraitType {
  Property = 'prop',
  Stat = 'stat',
  Ranking = 'ranking',
  Boost = 'boost',
}

interface Traits {
  [index: string]: Trait[]
  props: Trait[]
  stats: Trait[]
  rankings: Trait[]
  boosts: Trait[]
}

interface Trait {
  name: string
  value: string | number
  max?: string | number
  display_type: string
  trait_type: string
}

interface TraitData {
  traits: Trait[]
  collectionTraits: CollectionTraits
}

interface CollectionTraits {
  [index: string]: OpenSeaTraitStats
}

const TRAIT_HEADER_HEIGHT = 42
const TRAIT_HEADER_MARGIN_BOTTOM = 8

const RANK_HEIGHT = 40
const RANK_MARGIN = 8

// const traitHeaderStyle = {
//     height: TRAIT_HEADER_HEIGHT + 'px',
//     marginBottom: TRAIT_HEADER_MARGIN_BOTTOM + 'px'
// }

const rankStyle = {
    height: RANK_HEIGHT + 'px',
    marginBottom: RANK_MARGIN + 'px'
}

@customElement('nft-card-back')
export class NftCardBackTemplate extends LitElement {

  static get styles() {
    return css`
      .card-back {
        position: absolute;
        backface-visibility: hidden;
        width: 100%;
        height: 100%;
        transform: rotateY(180deg);
        top: 0;
        overflow: hidden;
      }
      .card-back p {
        margin: 10px;
      }
      .card-back-inner {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        column-gap: 10px;
        margin: 16px 24px;
      }
      .is-vertical {
        grid-template-columns: 1fr;
      }
      .attribute-container {
        text-align: left;
        text-transform: capitalize;
      }
      .is-vertical .attribute-container {
        margin: 15px 0;
      }
      .trait-header {
        display: flex;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        line-height: 20px;
        margin-bottom: 8px;
      }
      .trait-header p {
        margin: 0 0 10px 8px;
      }
      .trait-icon {
        height: 100%;
      }
      .trait_property {
        background: #edfbff;
        border: 1px solid #2d9cdb;
        border-radius: 5px;
        margin-bottom: 8px;
        display: grid;
        grid-template-columns: 50% 50%;
      }
      .trait_property p {
        margin: 7px 0;
        font-weight: 400;
        font-size: 15px;
        color: rgba(0, 0, 0, 0.87);
      }
      .trait_property .trait_property-type {
        text-transform: uppercase;
        font-weight: 500;
        color: #2d9cdb;
        opacity: 0.8;
        margin: 7px 10px;
      }
      .trait_property .trait_property-value {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .trait_ranking {
        margin-bottom: 16px;
        cursor: pointer;
      }
      .trait_ranking .trait_ranking-header {
        display: flex;
        justify-content: space-between;
      }
      .trait_ranking .trait_ranking-header .trait_ranking-header-name {
        color: rgba(0, 0, 0, 0.87);
        font-size: 14px;
      }

      .trait_ranking .trait_ranking-header .trait_ranking-header-value {
        color: #9e9e9e;
        font-size: 11px;
      }
      .trait_ranking .trait_ranking-bar {
        width: 100%;
        height: 6px;
        border-radius: 14px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        position: relative;
        background: #f3f3f3;
        margin-top: 4px;
      }

      .trait_ranking .trait_ranking-bar .trait_ranking-bar-fill {
        position: absolute;
        left: 1px;
        top: 1px;
        height: 4px;
        background: #3291e9;
        border-radius: 14px;
        max-width: calc(100% - 2px);
      }

      .stat {
        display: grid;
        grid-template-columns: 1fr 4fr;
        justify-items: left;
        align-items: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      }
      .stat-name {
        font-size: 20px;
        font-weight: 100;
        text-transform: capitalize;
        margin-left: 5px;
      }
      .stat-value {
        color: #2d9cdb;
        font-size: 34px;
        font-weight: 100;
        margin-left: 5px;
      }
      .trait_boost {
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        margin-bottom: 8px;
        padding-bottom: 8px;
      }
      .trait_boost .trait_boost-value {
        width: 30px;
        height: 30px;
        background-color: #2d9cdb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
      }
      .trait_boost .trait_boost-value p {
        font-size: 12px;
        color: #ffffff;
      }
    `
  }

  @property({type: Object}) public traitData!: TraitData
  @property({type: Boolean}) public loading = true
  @property({type: Boolean}) public horizontal!: boolean

  @property({type: Number}) public cardHeight!: number
  @property({type: Number}) public cardWidth!: number

  @property({type: Object}) private traits!: Traits

  private static formatTrait(trait: string) {
    return trait.replace(/_/g, ' ')
  }

  public updated(changedProperties: Map<string, string>) {
    // Assumption: If the traitData gets updated we should rebuild the
    // traits object that populates UI
    // Assumption: This will ONLY get called once per refresh
    changedProperties.forEach(async (_oldValue: string, propName: string) => {
      if (propName === 'traitData') {
        this.buildTraits(this.traitData)

        // We got the data so we are done loading
        this.loading = false

        // Tell the component to update with new state
        await this.requestUpdate()
      }
    })
    const el: HTMLElement = this.shadowRoot!.firstElementChild as HTMLElement
    this.cardHeight = el.offsetHeight
    this.cardWidth = el.offsetWidth
  }

  public getBoostsTemplate(boosts: any[]) {
    if (boosts.length <= 0) { return } // Don't render if empty array
    return html`
      <div class="trait-header">
        <div class="trait-icon">
          <svg
            width="10"
            height="100%"
            viewBox="0 0 8 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.666656 0.333336V7.66667H2.66666V13.6667L7.33332 5.66667H4.66666L7.33332 0.333336H0.666656Z"
              fill="#1C1F27"
            />
          </svg>
        </div>
        <p class="attribute-title">Boosts</p>
      </div>
      ${boosts.map(
        ({name, value}) => html`
          <div class="trait_boost">
            <div class="trait_boost-value">
              <p>+${value}</p>
            </div>
            <div class="trait_boost-name">
              ${NftCardBackTemplate.formatTrait(name)}
            </div>
          </div>
        `
      )}
    `
  }

  public getStatsTemplate(stats: Trait[]) {
  if (stats.length <= 0) {
    return undefined // Don't render if empty array
  }
  return html`
      <div class="trait-header">
        <div class="trait-icon">
          <svg
            width="15"
            height="100%"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.66666 11.3333H7.33332V0.666672H4.66666V11.3333ZM0.666656 11.3333H3.33332V6H0.666656V11.3333ZM8.66666 4V11.3333H11.3333V4H8.66666Z"
              fill="black"
            />
          </svg>
        </div>
        <p class="attribute-title">Stats</p>
      </div>
      ${stats.map(stat =>
        html`
            <div class="stat">
              <div class="stat-value">${stat.value}</div>
              <div class="stat-name">
                ${NftCardBackTemplate.formatTrait(stat.name)}
              </div>
            </div>
          `
      )}
    `
  }

  public getRankingsTemplate(rankings: Trait[]) {
    const traitHeightTotal = (TRAIT_HEADER_HEIGHT + TRAIT_HEADER_MARGIN_BOTTOM)

    const numRanksRender = Math.floor((this.cardHeight - traitHeightTotal) / (RANK_HEIGHT + RANK_MARGIN)) - 1
    const numRanksRemaining = rankings.length - numRanksRender
    return html`
      <div class="trait-header">
        <div class="trait-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="100%"
            viewBox="0 0 24 24"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"
            />
          </svg>
        </div>
        <p class="attribute-title">Rankings</p>
      </div>
      ${rankings.slice(0, numRanksRender).map(
        ({name, value, max}) => html`
          <div class="trait_ranking" style="${styleMap(rankStyle)}">
            <div class="trait_ranking-header">
              <div class="trait_ranking-header-name">
                ${NftCardBackTemplate.formatTrait(name)}
              </div>
              <div class="trait_ranking-header-value">${value} of ${max}</div>
            </div>
            <div class="trait_ranking-bar">
              <div
                class="trait_ranking-bar-fill"
                style=${styleMap({width: `${(+value / +max!) * 100}%`})}
              ></div>
            </div>
          </div>
        `
      )}
      ${numRanksRemaining > 0 ?
        html`<div class="remainingTraits">+${numRanksRemaining} more</div>`
      : ''}
    `
  }

  public getPropsTemplate(props: Trait[]) {
    const DISPLAY_MAX = 3
    const propsTemplate = []
    for (let i = 0; i < props.length && i < DISPLAY_MAX; i++) {
      propsTemplate.push(html`
        <div class="trait_property">
          <p class="trait_property-type">${NftCardBackTemplate.formatTrait(props[i].name)}</p>
          <p class="trait_property-value">${props[i].value}</p>
        </div>
      `)
    }

    return propsTemplate
  }

  public render() {
    // TODO: Add loading templates
    return html`
      <div class="card-back">
        <div
          class="card-back-inner ${classMap({'is-vertical': !this.horizontal})}"
        >
          <div class="attribute-container attribute-properties">
            <div class="trait-header">
              <div class="trait-icon">
                <svg
                  width="18"
                  height="100%"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 2.00001H9.33333V0.666672H0V2.00001ZM0 4.66667H9.33333V3.33334H0V4.66667ZM0 7.33334H9.33333V6H0V7.33334ZM10.6667 7.33334H12V6H10.6667V7.33334ZM10.6667 0.666672V2.00001H12V0.666672H10.6667ZM10.6667 4.66667H12V3.33334H10.6667V4.66667Z"
                    fill="#1C1F27"
                  />
                </svg>
              </div>
              <p class="attribute-title">Properties</p>
            </div>
            ${this.loading ? '' : this.getPropsTemplate(this.traits.props)}
          </div>

          <div class="attribute-container">
            ${this.loading  ? 'loadingTemplate()' :
    this.traits.rankings.length > 0 ? this.getRankingsTemplate(this.traits.rankings)
      : this.getStatsTemplate(this.traits.stats)
          }
          </div>
          <div class="attribute-container attribute-boosts">

            ${this.loading
              ? 'loadingTemplate()'
              : this.getBoostsTemplate(this.traits.boosts)}
          </div>
        </div>
      </div>
    `
  }

  private buildTraits(traitData: TraitData) {
    this.traits = {
      props: [],
      stats: [],
      rankings: [],
      boosts: []
    }
    const {traits: assetTraits, collectionTraits} = traitData

    for (const trait of assetTraits) {
      const type = this.getTraitType(trait, collectionTraits)

      const name = trait.trait_type

      this.traits[type + 's'].push({
        name,
        value: trait.value,
        ...(type === TraitType.Ranking ? { max: collectionTraits[name].max as unknown as number } : {}),
        trait_type: '',
        display_type: ''
      })
    }
  }

  private getTraitType(trait: Trait, collectionTraits: CollectionTraits) {
    if (this.isProperty(trait, collectionTraits)) { return TraitType.Property }
    if (this.isRanking(trait, collectionTraits)) { return TraitType.Ranking }
    if (this.isStat(trait)) { return TraitType.Stat }
    if (this.isBoost(trait)) { return TraitType.Boost }
    return null
  }

  private isBoost(trait: Trait) {
    return trait.display_type && trait.display_type.includes('boost')
  }

  private isRanking(trait: Trait, collectionTraits: CollectionTraits) {
    return trait.display_type === null && trait.trait_type in collectionTraits && 'max' in collectionTraits[trait.trait_type]
  }

  /**
   * IsStat - Checks to see if the given trait is a 'Stat'
   * A 'Stat' is defined as any trait that has a `display_type` of 'number'
   *
   * @param trait - The object containing an asset's trait
   * @return true if the trait is a 'Stat' and false otherwise
   */
  private isStat(trait: Trait) {
    return trait.display_type === 'number'
  }

  /**
   * IsProperty - Checks to see if the given trait is a 'Property'.
   * A 'Property' is defined as any trait that has a `display_type` of null
   * and does not have a min/max value
   *
   * @param trait - The object containing an asset's trait
   * @return true if the trait is a 'Property' and false otherwise
   */
  private isProperty(trait: Trait, collectionTraits: CollectionTraits) {
    return (
      trait.display_type === null &&
      trait.trait_type in collectionTraits ? !('max' in collectionTraits[trait.trait_type]) : true
    )
  }
}
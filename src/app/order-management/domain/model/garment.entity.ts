import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {roundToCurrency} from './money';

/**
 * Represents an individual clothing item (or group of identical items) registered inside an order.
 */
export class Garment implements BaseEntity {
  /**
   * The unique identifier of the garment inside its order.
   */
  #id: number;

  /**
   * The identifier of the order that contains the garment.
   */
  #orderId: number;

  /**
   * The kind of garment (shirt, trousers, blanket, ...).
   */
  #type: string;

  /**
   * The color of the garment.
   */
  #color: string;

  /**
   * The free observations about the garment (stains, damage, special care).
   */
  #notes: string;

  /**
   * The number of identical garments registered in this entry.
   */
  #quantity: number;

  /**
   * The price charged for each garment of this entry.
   */
  #unitPrice: number;

  /**
   * Creates a new garment entity.
   * @param garment - Initialization values.
   */
  constructor(garment: {
    id: number;
    orderId: number;
    type: string;
    color: string;
    notes: string;
    quantity: number;
    unitPrice: number;
  }) {
    this.#id = garment.id;
    this.#orderId = garment.orderId;
    this.#type = garment.type;
    this.#color = garment.color;
    this.#notes = garment.notes;
    this.#quantity = garment.quantity;
    this.#unitPrice = garment.unitPrice;
  }

  /**
   * Gets the garment id.
   * @returns The unique identifier of the garment inside its order.
   */
  get id(): number {
    return this.#id;
  }

  /**
   * Gets the order id.
   * @returns The identifier of the order that contains the garment.
   */
  get orderId(): number {
    return this.#orderId;
  }

  /**
   * Gets the garment type.
   * @returns The kind of garment.
   */
  get type(): string {
    return this.#type;
  }

  /**
   * Gets the garment color.
   * @returns The color of the garment.
   */
  get color(): string {
    return this.#color;
  }

  /**
   * Sets the garment color.
   * @param value - The color to set for the garment.
   */
  set color(value: string) {
    this.#color = value;
  }

  /**
   * Gets the garment notes.
   * @returns The free observations about the garment.
   */
  get notes(): string {
    return this.#notes;
  }

  /**
   * Sets the garment notes.
   * @param value - The observations to set for the garment.
   */
  set notes(value: string) {
    this.#notes = value;
  }

  /**
   * Gets the garment quantity.
   * @returns The number of identical garments registered in this entry.
   */
  get quantity(): number {
    return this.#quantity;
  }

  /**
   * Gets the unit price.
   * @returns The price charged for each garment of this entry.
   */
  get unitPrice(): number {
    return this.#unitPrice;
  }

  /**
   * Gets the garment subtotal.
   * @returns The amount of this entry: quantity multiplied by unit price.
   */
  get subtotal(): number {
    return roundToCurrency(this.#quantity * this.#unitPrice);
  }
}

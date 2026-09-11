/**
 * Banner domain type.
 *
 * Represents a single banner entry fetched from the database and mapped
 * for presentation in the banner carousel components.
 */
export interface Banner {
  /** Unique identifier (UUID from the database, or a stable slug for mocks). */
  id: string;

  /** Primary headline displayed on the banner. */
  title: string;

  /** Supporting sub-headline shown below the title. */
  subtitle: string;

  /** Call-to-action button label. */
  buttonText: string;

  /** Destination href for the CTA button. */
  buttonHref: string;

  /**
   * Absolute public path to the banner product image.
   * e.g. "/assets/images/hero_section_new_arrival.png"
   */
  image: string;

  /** Accessible alt text for the banner image. */
  imageAlt: string;

  /**
   * Optional display order hint. Lower numbers appear first.
   * The server is responsible for sorting; the carousel renders
   * whatever order it receives.
   */
  displayOrder?: number;

  /** Whether this banner should be shown. Defaults to true. */
  isActive?: boolean;
}

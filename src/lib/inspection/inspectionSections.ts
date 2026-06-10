/**
 * Carschek Inspection — Section Field Definitions
 * 27 sections as specified in the content update prompt.
 * Sections 4 (Photos) and 25 (Damages) are handled by dedicated screens.
 * Section 27 (Save Report) is a summary screen with no checklist items.
 */

export type ToggleType = 'yes-no' | 'yes-no-na';
export type FieldType =
  | 'dropdown'
  | 'text' |'number' |'segmented' |'toggle' |'textarea';

export interface DropdownField {
  id: string;
  label: string;
  type: 'dropdown';
  options: string[];
  required: boolean;
  clearable?: boolean;
}

export interface TextField {
  id: string;
  label: string;
  type: 'text' | 'number';
  required: boolean;
}

export interface SegmentedField {
  id: string;
  label: string;
  type: 'segmented';
  options: string[];
  required: boolean;
}

export interface ToggleField {
  id: string;
  label: string;
  type: 'toggle';
  toggleType: ToggleType;
  required: boolean;
}

export interface TextareaField {
  id: string;
  label: string;
  type: 'textarea';
  placeholder: string;
  required: boolean;
}

export type SectionField =
  | DropdownField
  | TextField
  | SegmentedField
  | ToggleField
  | TextareaField;

export interface SectionDef {
  id: string;
  name: string;
  /** 'form' = structured form fields, 'toggle-grid' = two-column toggle grid, 'comments' = textarea grid, 'photos' = photo capture, 'damages' = damage map, 'summary' = save report */
  layout: 'form' | 'toggle-grid' | 'comments' | 'photos' | 'damages' | 'summary';
  fields?: SectionField[];
  /** For toggle-grid sections: pairs of [left, right] items. Right can be null for odd items. */
  toggleRows?: Array<{ left: ToggleItem; right: ToggleItem | null }>;
  /** For comments section */
  commentFields?: Array<{ id: string; label: string; placeholder: string }>;
}

export interface ToggleItem {
  id: string;
  label: string;
  toggleType: ToggleType;
  required: boolean;
}

// ─── Helper ────────────────────────────────────────────────────────────────

function yn(id: string, label: string): ToggleItem {
  return { id, label, toggleType: 'yes-no', required: true };
}

function yna(id: string, label: string): ToggleItem {
  return { id, label, toggleType: 'yes-no-na', required: true };
}

// ─── Section Definitions ───────────────────────────────────────────────────

export const SECTION_DEFS: SectionDef[] = [
  // ── S01: Customer Details ──────────────────────────────────────────────
  {
    id: 'S01',
    name: 'Customer Details',
    layout: 'form',
    fields: [
      { id: 's01_salutation', label: 'Salutation', type: 'dropdown', options: ['Mr', 'Mrs', 'Miss', 'Dr', 'Engr'], required: true },
      { id: 's01_first_name', label: 'First Name', type: 'text', required: true },
      { id: 's01_last_name', label: 'Last Name', type: 'text', required: true },
      { id: 's01_email', label: 'Email', type: 'text', required: true },
      { id: 's01_country', label: 'Country', type: 'dropdown', options: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Other'], required: true },
      { id: 's01_booking_id', label: 'Simplybook BookingID', type: 'text', required: true },
      { id: 's01_service_type', label: 'Service Type', type: 'dropdown', options: ['Pre-Purchase Inspection', 'Periodic Inspection', 'Pre-Sale Inspection', 'Insurance Inspection'], required: true },
      { id: 's01_inspection_subtype', label: 'Inspection SubType', type: 'dropdown', options: ['Standard', 'Premium', 'Express', 'Corporate'], required: true },
      { id: 's01_customer_type', label: 'Customer Type', type: 'dropdown', options: ['Individual', 'Corporate'], required: true },
      { id: 's01_location', label: 'Location', type: 'dropdown', options: ['Lagos Island', 'Lagos Mainland', 'Abuja Central', 'Abuja Outskirts', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Other'], required: true },
      { id: 's01_zone', label: 'Zone', type: 'dropdown', options: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'], required: true },
    ],
  },

  // ── S02: Documentation ────────────────────────────────────────────────
  {
    id: 'S02',
    name: 'Documentation',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s02_vehicle_license', 'Vehicle License'), right: yna('s02_ecmr', 'ECMR') },
      { left: yna('s02_proof_ownership', 'Proof of Ownership'), right: yna('s02_road_worthiness', 'Road Worthiness') },
      { left: yna('s02_insurance_clearance', 'Insurance Clearance'), right: yna('s02_custom_clearance', 'Custom Clearance') },
      { left: yna('s02_purchase_receipt', 'Purchase Receipt'), right: yna('s02_tinted_permit', 'Tinted Permit') },
      { left: yna('s02_plate_number', 'Plate Number'), right: null },
    ],
  },

  // ── S03: Car Details ──────────────────────────────────────────────────
  {
    id: 'S03',
    name: 'Car Details',
    layout: 'form',
    fields: [
      { id: 's03_brand', label: 'Brand', type: 'dropdown', options: ['Toyota', 'Honda', 'Lexus', 'Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Volkswagen', 'Peugeot', 'Mitsubishi', 'Subaru', 'Jeep', 'Land Rover', 'Range Rover', 'Porsche', 'Volvo', 'Infiniti', 'Acura', 'Cadillac', 'Buick', 'GMC', 'Dodge', 'Chrysler', 'Lincoln', 'Tesla', 'Other'], required: true, clearable: true },
      { id: 's03_model', label: 'Model', type: 'text', required: true },
      { id: 's03_year', label: 'Year', type: 'dropdown', options: Array.from({ length: 36 }, (_, i) => String(2025 - i)), required: true, clearable: true },
      { id: 's03_transmission', label: 'Transmission', type: 'dropdown', options: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'], required: true, clearable: true },
      { id: 's03_chasis_number', label: 'Chasis Number', type: 'text', required: false },
      { id: 's03_body_type', label: 'Body Type', type: 'dropdown', options: ['SUV', 'Sedan', 'Hatchback', 'Pickup', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Bus', 'Truck'], required: true, clearable: true },
      { id: 's03_engine_capacity', label: 'Engine Capacity', type: 'text', required: false },
      { id: 's03_fuel_type', label: 'Fuel Type', type: 'dropdown', options: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG', 'LPG'], required: true, clearable: true },
      { id: 's03_exterior_colour', label: 'Exterior Colour', type: 'dropdown', options: ['White', 'Black', 'Silver', 'Grey', 'Blue', 'Red', 'Brown', 'Gold', 'Green', 'Yellow', 'Orange', 'Purple', 'Beige', 'Pearl White', 'Navy Blue', 'Other'], required: true, clearable: true },
      { id: 's03_interior_colour', label: 'Interior Colour', type: 'dropdown', options: ['Black', 'Beige', 'Grey', 'Brown', 'Cream', 'Red', 'White', 'Other'], required: true, clearable: true },
      { id: 's03_mileage', label: 'Mileage', type: 'number', required: true },
      { id: 's03_mileage_unit', label: 'Mileage Unit', type: 'segmented', options: ['KILOMETERS', 'MILES'], required: true },
      { id: 's03_licence_plate', label: 'Licence Plate', type: 'text', required: true },
      { id: 's03_city_location', label: 'City / Location', type: 'dropdown', options: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Benin City', 'Kaduna', 'Owerri', 'Warri', 'Other'], required: true, clearable: true },
      { id: 's03_steering_type', label: 'Steering Type', type: 'dropdown', options: ['Hydraulic Steering', 'Electric Power Steering', 'Manual Steering', 'Electro-Hydraulic Steering'], required: true, clearable: true },
      { id: 's03_drive_type', label: 'Drive Type', type: 'dropdown', options: ['4 Wheel Drive', 'All Wheel Drive', 'Front Wheel Drive', 'Rear Wheel Drive'], required: true, clearable: true },
      { id: 's03_bought_condition', label: 'Bought Condition', type: 'segmented', options: ['NEW', 'IMPORTED', 'REGISTERED'], required: true },
      { id: 's03_selling_condition', label: 'Selling Condition', type: 'segmented', options: ['NEW', 'IMPORTED', 'REGISTERED'], required: true },
    ],
  },

  // ── S04: Photos (dedicated screen — no fields here) ───────────────────
  {
    id: 'S04',
    name: 'Photos',
    layout: 'photos',
  },

  // ── S05: Body Frame Checklist ─────────────────────────────────────────
  {
    id: 'S05',
    name: 'Body Frame Checklist',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s05_front_rail_left', 'Front Rail (Left)'), right: yna('s05_cowl_panel_firewall', 'Cowl Panel Firewall') },
      { left: yna('s05_a_pillar_right', 'A Pillar (Right)'), right: yna('s05_a_pillar_left', 'A Pillar (Left)') },
      { left: yna('s05_b_pillar_right', 'B Pillar (Right)'), right: yna('s05_b_pillar_left', 'B Pillar (Left)') },
      { left: yna('s05_c_pillar_right', 'C Pillar (Right)'), right: yna('s05_c_pillar_left', 'C Pillar (Left)') },
      { left: yna('s05_rear_lock_pillar_right', 'Rear Lock Pillar (Right)'), right: yna('s05_rear_lock_pillar_left', 'Rear Lock Pillar (Left)') },
      { left: yna('s05_boot_floor', 'Boot Floor'), right: yna('s05_boot_lock_pillar', 'Boot Lock Pillar') },
      { left: yna('s05_engraved', 'Engraved'), right: yna('s05_converted_rhd_lhd', 'Converted (RHD to LHD)') },
      { left: yna('s05_no_accident_history', 'No Accident History'), right: null },
    ],
  },

  // ── S06: Shields ──────────────────────────────────────────────────────
  {
    id: 'S06',
    name: 'Shields',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s06_door_fittings_rear_left', 'Door Fittings (Rear Left)'), right: yna('s06_door_levers_front_right', 'Door Levers (Front Right)') },
      { left: yna('s06_front_left_door_levers', 'Front Left Door Levers'), right: yna('s06_rear_right_door_levers', 'Rear Right Door Levers') },
      { left: yna('s06_door_levers_rear_left', 'Door Levers (Rear Left)'), right: yna('s06_front_windshield', 'Front Windshield') },
      { left: yna('s06_rear_windshield', 'Rear Windshield'), right: yna('s06_door_window_front_right', 'Door Window (Front Right)') },
      { left: yna('s06_door_window_front_left', 'Door Window (Front Left)'), right: yna('s06_rear_right_door_window', 'Rear Right Door Window') },
      { left: yna('s06_door_window_rear_left', 'Door Window (Rear Left)'), right: yna('s06_under_body_shields', 'Under Body Shields') },
      { left: yna('s06_fender_shields', 'Fender Shields'), right: yna('s06_front_spoiler', 'Front Spoiler') },
      { left: yna('s06_rear_spoiler_ok', 'Rear Spoiler OK'), right: null },
    ],
  },

  // ── S07: Lights ───────────────────────────────────────────────────────
  {
    id: 'S07',
    name: 'Lights',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s07_head_light_right', 'Head Light (Right)'), right: yna('s07_left_headlight', 'Left Headlight') },
      { left: yna('s07_tail_light_right', 'Tail Light (Right)'), right: yna('s07_tail_light_left', 'Tail Light (Left)') },
      { left: yna('s07_reverse_light', 'Reverse Light'), right: yna('s07_fog_lights', 'Fog Lights') },
    ],
  },

  // ── S08: Mirrors ──────────────────────────────────────────────────────
  {
    id: 'S08',
    name: 'Mirrors',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s08_side_mirror_right', 'Side Mirror (Right)'), right: yna('s08_side_mirror_left', 'Side Mirror (Left)') },
      { left: yna('s08_side_mirror_control_right', 'Side Mirror Control (Right)'), right: yna('s08_side_mirror_control_left', 'Side Mirror Control (Left)') },
      { left: yna('s08_side_mirror_broken_right', 'Side Mirror Broken (Right)'), right: yna('s08_side_mirror_broken_left', 'Side Mirror Broken (Left)') },
    ],
  },

  // ── S09: Equipment ────────────────────────────────────────────────────
  {
    id: 'S09',
    name: 'Equipment',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s09_tools', 'Tools'), right: yna('s09_jack', 'Jack') },
      { left: yna('s09_jack_handle_present', 'Jack Handle Present'), right: yna('s09_wheel_spanner_present', 'Wheel Spanner Present') },
      { left: yna('s09_c_caution_present', 'C-Caution Present'), right: null },
    ],
  },

  // ── S10: Fluids / Filters Check ───────────────────────────────────────
  {
    id: 'S10',
    name: 'Fluids / Filters Check',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s10_engine_oil', 'Engine Oil'), right: yna('s10_engine_sump_oil_seal', 'Engine Sump Oil Seal') },
      { left: yna('s10_oil_seal_leakage', 'Oil Seal Leakage'), right: yna('s10_engine_valve_cover_seal', 'Engine Valve Cover Seal') },
      { left: yna('s10_axle_oil_seal', 'Axle Oil Seal'), right: yna('s10_gear_oil_seal', 'Gear Oil Seal') },
      { left: yna('s10_gear_oil', 'Gear Oil'), right: yna('s10_brake_oil', 'Brake Oil') },
      { left: yna('s10_brake_oil_leakage', 'Brake Oil Leakage'), right: yna('s10_power_steering_oil', 'Power Steering Oil') },
      { left: yna('s10_power_steering', 'Power Steering'), right: yna('s10_power_steering_oil_pump', 'Power Steering Oil Pump') },
      { left: yna('s10_power_steering_oil_leakage', 'Power Steering Oil Leakage'), right: yna('s10_washer_fluid', 'Washer Fluid') },
      { left: yna('s10_washer_fluid_compartment', 'Washer Fluid Compartment'), right: null },
    ],
  },

  // ── S11: Car Frame ────────────────────────────────────────────────────
  {
    id: 'S11',
    name: 'Car Frame',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s11_wires', 'Wires'), right: yna('s11_belt', 'Belt') },
      { left: yna('s11_pulley', 'Pulley'), right: yna('s11_engine_noise', 'Engine Noise') },
      { left: yna('s11_engine_mount', 'Engine Mount'), right: yna('s11_radiator_fan', 'Radiator Fan') },
    ],
  },

  // ── S12: Exhaust Check ────────────────────────────────────────────────
  {
    id: 'S12',
    name: 'Exhaust Check',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s12_exhaust_sound', 'Exhaust Sound'), right: yna('s12_exhaust_joint', 'Exhaust Joint') },
      { left: yna('s12_catalytic_converter', 'Catalytic Converter'), right: yna('s12_exhaust_leakage', 'Exhaust Leakage') },
    ],
  },

  // ── S13: Engine Check ─────────────────────────────────────────────────
  {
    id: 'S13',
    name: 'Engine Check',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s13_radiator', 'Radiator'), right: yna('s13_starter_operation', 'Starter Operation') },
      { left: yna('s13_engine_vibration', 'Engine Vibration'), right: yna('s13_engine_worked_on', 'Engine Worked On') },
      { left: yna('s13_engine_misfire', 'Engine Misfire'), right: yna('s13_tappet_sound', 'Tappet Sound') },
      { left: yna('s13_knocking_sound_present', 'Knocking Sound Present'), right: yna('s13_no_overheating_history', 'No Overheating History') },
    ],
  },

  // ── S14: Brakes ───────────────────────────────────────────────────────
  {
    id: 'S14',
    name: 'Brakes',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s14_brake_pads', 'Brake Pads'), right: yna('s14_discs', 'Discs') },
      { left: yna('s14_parking_hand', 'Parking Hand'), right: yna('s14_brakes', 'Brakes') },
    ],
  },

  // ── S15: Suspension Steering ──────────────────────────────────────────
  {
    id: 'S15',
    name: 'Suspension Steering',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s15_ball_joints', 'Ball Joints'), right: yna('s15_zlinks', 'Zlinks') },
      { left: yna('s15_front_bushes', 'Front Bushes'), right: yna('s15_front_shocks', 'Front Shocks') },
      { left: yna('s15_tie_rod', 'Tie Rod'), right: yna('s15_rack_end', 'Rack End') },
      { left: yna('s15_rear_bushes', 'Rear Bushes'), right: yna('s15_rear_shocks', 'Rear Shocks') },
    ],
  },

  // ── S16: Steering Control ─────────────────────────────────────────────
  {
    id: 'S16',
    name: 'Steering Control',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s16_lights_lever_switch', 'Lights Lever / Switch is Working'), right: yna('s16_washer_lever', 'Washer Lever') },
      { left: yna('s16_wind_screen_wiper', 'Wind Screen Wiper'), right: yna('s16_steering_wheel', 'Steering Wheel') },
      { left: yna('s16_horn', 'Horn'), right: yna('s16_volume_control', 'Volume Control') },
      { left: yna('s16_temperature_control', 'Temperature Control'), right: null },
    ],
  },

  // ── S17: Transmission ─────────────────────────────────────────────────
  {
    id: 'S17',
    name: 'Transmission',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s17_gear_surge', 'Gear Surge'), right: yna('s17_gear_shift_selection', 'Gear Shift / Selection Operations') },
      { left: yna('s17_gear_converted', 'Gear Converted'), right: yna('s17_manual_clutch_operation', 'Manual Clutch Operation') },
      { left: yna('s17_gear_mount', 'Gear Mount'), right: yna('s17_no_gear_jerk', 'No Gear Jerk') },
      { left: yna('s17_no_gear_repair_history', 'No Gear Repair History'), right: yna('s17_4wd_active', '4WD Active') },
      { left: yna('s17_differential_axle_oil', 'Differential/Axle Oil'), right: yna('s17_propeller_shaft', 'Propeller Shaft') },
    ],
  },

  // ── S18: Seats ────────────────────────────────────────────────────────
  {
    id: 'S18',
    name: 'Seats',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s18_seat_adjuster_recliner_right', 'Seat Adjuster Recliner (Right)'), right: yna('s18_seat_adjuster_recliner_left', 'Seat Adjuster Recliner (Left)') },
      { left: yna('s18_seat_adjuster_lear_track_right', 'Seat Adjuster Lear Track (Right)'), right: yna('s18_seat_adjuster_lear_track_left', 'Seat Adjuster Lear Track (Left)') },
      { left: yna('s18_seat_adjuster_tracker', 'Seat Adjuster Tracker'), right: yna('s18_right_seat_belt', 'Right Seat Belt') },
      { left: yna('s18_left_seat_belt', 'Left Seat Belt'), right: yna('s18_rear_seat_belt', 'Rear Seat Belt') },
      { left: yna('s18_head_rest', 'Head Rest'), right: yna('s18_volume_control', 'Volume Control') },
      { left: yna('s18_glove_box', 'Glove Box'), right: null },
    ],
  },

  // ── S19: Windows ──────────────────────────────────────────────────────
  {
    id: 'S19',
    name: 'Windows',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s19_window_lever_right_front', 'Window Lever Right (Front)'), right: yna('s19_window_lever_left_front', 'Window Lever (Left Front)') },
      { left: yna('s19_window_lever_right_rear', 'Window Lever (Right Rear)'), right: yna('s19_window_lever_left_rear', 'Window Lever (Left Rear)') },
      { left: yna('s19_auto_lock', 'Auto Lock'), right: yna('s19_window_safety_lock', 'Window Safety Lock') },
    ],
  },

  // ── S20: Electronic Control ───────────────────────────────────────────
  {
    id: 'S20',
    name: 'Electronic Control',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s20_interior_lights', 'Interior Lights'), right: yna('s20_dashboard_control_ac', 'Dashboard Control AC') },
      { left: yna('s20_dashboard_control_hazzard', 'Dashboard Control Hazzard Lights'), right: yna('s20_audio_ok', 'Audio OK') },
      { left: yna('s20_cigarette_lighter', 'Cigarette Lighter'), right: yna('s20_fuel_cap_release_lever', 'Fuel Cap Release Lever') },
      { left: yna('s20_bonnet_release_lever', 'Bonnet Release Lever'), right: null },
    ],
  },

  // ── S21: General Upholstery ───────────────────────────────────────────
  {
    id: 'S21',
    name: 'General Upholstery',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s21_roof_upholstery', 'Roof Upholstery'), right: yna('s21_floor_upholstery', 'Floor Upholstery') },
      { left: yna('s21_door_upholstery', 'Door Upholstery'), right: yna('s21_clean_dashboard', 'Clean Dashboard') },
      { left: yna('s21_sunshade', 'Sunshade'), right: yna('s21_boot_carpet', 'Boot Carpet') },
      { left: yna('s21_boot_board', 'Boot Board'), right: yna('s21_driver_seat_upholstery', 'Driver Seat Upholstery') },
      { left: yna('s21_passenger_seat_upholstery', 'Passenger Seat Upholstery'), right: yna('s21_rear_seat_upholstery', 'Rear Seat Upholstery') },
    ],
  },

  // ── S22: AC ───────────────────────────────────────────────────────────
  {
    id: 'S22',
    name: 'AC',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s22_cooling', 'Cooling'), right: yna('s22_blower', 'Blower') },
      { left: yna('s22_ac_fan', 'A.C Fan'), right: yna('s22_condensor', 'Condensor') },
      { left: yna('s22_compressor', 'Compressor'), right: yna('s22_ac_no_repair_history', 'AC No Repair History') },
    ],
  },

  // ── S23: Electrical Electronics ───────────────────────────────────────
  {
    id: 'S23',
    name: 'Electrical Electronics',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s23_battery_terminals', 'Battery Terminals'), right: yna('s23_battery_charging', 'Battery Charging') },
      { left: yna('s23_battery_malfunction_indicator', 'Battery Malfunction Indicator'), right: yna('s23_battery_present', 'Battery Present') },
    ],
  },

  // ── S24: OBD ──────────────────────────────────────────────────────────
  {
    id: 'S24',
    name: 'OBD',
    layout: 'toggle-grid',
    toggleRows: [
      { left: yna('s24_crank_shaft_sensor', 'Crank Shaft Sensor'), right: yna('s24_camshaft_sensor', 'Camshaft Sensor') },
      { left: yna('s24_oxygen_sensor', 'Oxygen Sensor'), right: yna('s24_map_sensor', 'Map Sensor') },
      { left: yna('s24_throttle_position_sensor', 'Throttle Position Sensor'), right: yna('s24_coolant_sensor', 'Coolant Sensor') },
      { left: yna('s24_air_flow_sensor', 'Air Flow Sensor'), right: yna('s24_window_safety_lock', 'Window Safety Lock') },
      { left: yna('s24_evap', 'EVAP'), right: yna('s24_abs', 'ABS') },
      { left: yna('s24_srs', 'SRS'), right: yna('s24_bcm', 'BCM') },
      { left: yna('s24_pcm', 'PCM'), right: yna('s24_detonation_sensor', 'Detonation Sensor') },
      { left: yna('s24_egr_sensor', 'EGR Sensor'), right: yna('s24_vehicle_speed', 'Vehicle Speed') },
      { left: yna('s24_gear_shaft_solenoid', 'Gear Shaft/Solenoid'), right: yna('s24_catalyst_sensor_right', 'Catalyst Sensor') },
      { left: yna('s24_catalyst_sensor_left', 'Catalyst Sensor'), right: null },
    ],
  },

  // ── S25: Damages (dedicated screen — no fields here) ──────────────────
  {
    id: 'S25',
    name: 'Damages',
    layout: 'damages',
  },

  // ── S26: Comments ─────────────────────────────────────────────────────
  {
    id: 'S26',
    name: 'Comments',
    layout: 'comments',
    commentFields: [
      { id: 's26_transmission', label: 'Transmission', placeholder: 'e.g. DELAY, OIL LEAKAGE FROM GEAR SEAL, SURGE' },
      { id: 's26_engine', label: 'Engine', placeholder: 'e.g. TAPPET NOISE, OVER HEATING HISTORY (FAN CONNECTED DIRECTLY),' },
      { id: 's26_electricals', label: 'Electricals', placeholder: 'e.g. ABS FAULTY, AIR BAG DEPLOYED HISTORY, WIRING TAMPERED, COOLANT SENSOR FAULTY' },
      { id: 's26_exterior', label: 'Exterior', placeholder: 'e.g. REPAINTED AND NOT FIRST BODY, DENTS AND SCRATCHES ON BODY, IMPACT REPAIR HISTORY' },
      { id: 's26_interior', label: 'Interior', placeholder: 'e.g. TORN SEAT UPHOLSTERY, FADED DASHBOARD UPHOLSTERY (GENERAL UPHOLSTERY WORK NEEDED), A.C NOT COOLING,' },
      { id: 's26_suspension', label: 'Suspension', placeholder: 'e.g. NOISY, STIFF STEERING (FAULTY POWER STEERING PUMP AND RACK, AND OIL LEAKAGE), ENGINE AND GEAR MOUNT HAS CLEARANCE' },
    ],
  },

  // ── S27: Save Report ──────────────────────────────────────────────────
  {
    id: 'S27',
    name: 'Save Report',
    layout: 'summary',
  },
];

export function getSectionDef(sectionId: string): SectionDef | undefined {
  return SECTION_DEFS.find(s => s.id === sectionId);
}

/** Returns total toggle items in a toggle-grid section (for progress tracking). */
export function countToggleItems(def: SectionDef): number {
  if (def.layout !== 'toggle-grid' || !def.toggleRows) return 0;
  return def.toggleRows.reduce((acc, row) => {
    return acc + 1 + (row.right ? 1 : 0);
  }, 0);
}

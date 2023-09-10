/**
 * pi_3L8qNDJEtINljGAa0ukexNuA
 * Events only for Supports and Extras.
 */
type IBmcTimeFormat = '2022-06-07 15:57:40';
type IBmcTimeSeconds = number;
type IBmcCurrency = 'USD' | 'EUR';
type IBmcBoolean = 'true' | 'false';
export type IBmcHookType =
    | 'donation.created'
    | 'donation.refunded'
    | 'extra_purchase.created'
    | 'extra_purchase.refunded'
    | 'membership.started'
    | 'membership.updated'
    | 'membership.cancelled';
type IBmcObject = 'membership' | 'payment';
type IBmcStatus = 'succeeded' | 'refunded';

export interface IBmcHookBase {
    type: IBmcHookType;
    live_mode: boolean;
    /** @example 1 */
    attempt: number;
    created: IBmcTimeSeconds;
    /** @example 1 */
    event_id: number;
    data: {};
}
export interface IBmcDonationCreated extends IBmcHookBase {
    type: 'donation.created' | 'donation.refunded';
    data: {
        id: number;
        /** @example 5 */
        amount: number;
        object: IBmcObject;
        status: IBmcStatus;
        /** @example "John bought you a coffee" */
        message: string;
        currency: IBmcCurrency;
        refunded: IBmcBoolean;
        created_at: IBmcTimeSeconds;
        note_hidden: IBmcBoolean;
        refunded_at: null | number;
        /** @example "Thanks for the good work" */
        support_note: string;
        support_type: 'Supporter';
        supporter_name: 'John';
        /** @example "pi_3Mc51bJEtINljGAa0zVykgUE"*/
        transaction_id: 'pi_3Mc51bJEtINljGAa0zVykgUE';
        application_fee: '0.25';
        supporter_email: 'john@example.com';
        total_amount_charged: '5.45';
    };
}
export interface IBmcDonationRefunded extends IBmcDonationCreated {
    type: 'donation.refunded';
}
export interface IBmcPageResponse {
    current_page: number;
    first_page_url: string;
    /** @example 6 */
    from: number;
    last_page: number;
    /** @example "https://developers.buymeacoffee.com/api/v1/supporters?page=11" */
    last_page_url: string;
    /** @example "https://developers.buymeacoffee.com/api/v1/supporters?page=3" */
    next_page_url: string;
    /** @example "https://developers.buymeacoffee.com/api/v1/supporters" */
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
}

export interface IBmcSupport {
    country: string;
    is_refunded: null;
    order_payload: null;
    payer_email: string;
    payer_name: string;
    /** @example "stripe" */
    payment_platform: string;
    /** @example "https://accounts.google.com/"" */
    referer: string | null;
    /** @example "5.0000" */
    support_coffee_price: string;
    support_coffees: number;
    /** @example "2022-05-14 10:29:48" */
    support_created_on: string;
    /** @example "EUR" */
    support_currency: string;
    support_email: string;
    support_hidden: 0 | 1;
    support_id: number;
    /** Message from the supporter */
    support_note: string;
    /** @example "2022-05-14 10:29:48" */
    support_updated_on: string;
    support_visibility: 0 | 1;
    supporter_name: string;
    /** @example "pi_3L712mJEtIsfgdfKIokjYYUofdKuJ" */
    transaction_id: string | 'FREE_REWARD';
    transfer_id: null | any;
}

export interface BmcSupportersResponse extends IBmcPageResponse {
    data: IBmcSupport[];
}

export interface IBmcExtras {
    extra: IBmcExtraData;
    payer_email: string;
    payer_name: string;
    /** @example "0.00" */
    purchase_amount: string;
    /** @example "EUR" */
    purchase_currency: string;
    purchase_id: number;
    purchase_is_revoked: 0 | 1;
    /** @example "How are you?" */
    purchase_question?: string;
    purchase_updated_on: IBmcTimeFormat;
    purchased_on: IBmcTimeFormat;
}

export interface IBmcExtraData {
    /** JSON stringified */
    attributes?: string;
    /** @example "0.00" */
    reward_coffee_price: string;
    /** @example "Congratulations! Your reward will be credited to the account associated with the email you specified" */
    reward_confirmation_message: string;
    reward_created_on: IBmcTimeFormat;
    reward_deleted_on: string | null;
    reward_description: string;
    reward_has_membership_pricing: 0 | 1;
    reward_id: number;
    /** @example "https://cdn.buymeacoffee.com/uploads/project_updates/2022/05/5d06315dc725ca284f01558527c1bdb6.jpg" */
    reward_image: string;
    reward_is_active: 0 | 1;
    /** @example "0.00" */
    reward_member_price: string;
    reward_order: 0 | 1;
    /** @example "Whats ur email" */
    reward_question: string;
    reward_slots: string | null;
    /** @example "Vip Subscription 1 month" */
    reward_title: string;
    reward_updated_on: IBmcTimeFormat;
    reward_used: number;
    reward_visibility: 0 | 1;
}

export interface IBmcExtrasResponse extends IBmcPageResponse {
    data: IBmcExtras[];
}

export interface IBmcSubscription {
    country: string | null;
    is_manual_payout: 0 | 1;
    is_paused: 0 | 1;
    is_razorpay: 0 | 1;
    membership_level_id: number;
    message_visibility: 0 | 1;
    payer_email: string;
    payer_name: string;
    referer: string | null;
    subscription_cancelled_on: IBmcTimeFormat;
    subscription_coffee_num: 0 | 1;
    subscription_coffee_price: string;
    subscription_created_on: string;
    subscription_currency: string;
    subscription_current_period_end: IBmcTimeFormat;
    subscription_current_period_start: IBmcTimeFormat;
    subscription_duration_type: 'month' | 'lifetime-giveaway';
    subscription_hidden: 0 | 1;
    subscription_id: number;
    subscription_is_cancelled: string | null;
    subscription_is_cancelled_at_period_end: string | null;
    subscription_message: string | null;
    subscription_updated_on: IBmcTimeFormat;
    transaction_id: 'GIVE_AWAY' | string;
}

export interface IBmcSubscriptionsResponse extends IBmcPageResponse {
    data: IBmcSubscription[];
}

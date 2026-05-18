const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY
const PAYSTACK_API_BASE = "https://api.paystack.co"

export interface PaystackInitializePaymentParams {
  email: string
  amount: number // in kobo (smallest currency unit)
  reference?: string
  metadata?: Record<string, any>
  callback_url?: string
}

export interface PaystackVerifyPaymentResponse {
  status: boolean
  message: string
  data?: {
    id: number
    reference: string
    amount: number
    paid_at: string
    payer_email: string
    payer_phone: string
    fees: number
    metadata: Record<string, any>
    authorization?: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
    }
    customer?: {
      id: number
      customer_code: string
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string
      metadata: Record<string, any>
    }
  }
}

export interface PaystackCreateSubscriptionParams {
  customer: string // email or customer_code
  plan: string // plan_code
  authorization?: string // authorization_code for recurring charges
  start_date?: string // optional start date
}

export const paystack = {
  // Initialize a one-time payment
  async initializePayment(
    params: PaystackInitializePaymentParams
  ): Promise<{
    status: boolean
    message: string
    data?: {
      authorization_url: string
      access_code: string
      reference: string
    }
  }> {
    try {
      const response = await fetch(
        `${PAYSTACK_API_BASE}/transaction/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
          body: JSON.stringify({
            email: params.email,
            amount: params.amount,
            reference: params.reference,
            metadata: params.metadata,
            callback_url: params.callback_url,
          }),
        }
      )

      return await response.json()
    } catch (error) {
      console.error("Paystack initialize payment error:", error)
      throw error
    }
  },

  // Verify a payment
  async verifyPayment(
    reference: string
  ): Promise<PaystackVerifyPaymentResponse> {
    try {
      const response = await fetch(
        `${PAYSTACK_API_BASE}/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      )

      return await response.json()
    } catch (error) {
      console.error("Paystack verify payment error:", error)
      throw error
    }
  },

  // Create a plan for subscriptions
  async createPlan(
    name: string,
    description: string,
    amount: number, // monthly amount in kobo
    interval: string = "monthly" // monthly, quarterly, biannually, annually
  ): Promise<{
    status: boolean
    message: string
    data?: {
      id: number
      name: string
      plan_code: string
      description: string
      amount: number
      interval: string
      send_invoices: boolean
      send_sms: boolean
      hosted_page: boolean
      currency: string
      created_at: string
    }
  }> {
    try {
      const response = await fetch(`${PAYSTACK_API_BASE}/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          name,
          description,
          amount,
          interval,
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("Paystack create plan error:", error)
      throw error
    }
  },

  // Create a subscription for a customer
  async createSubscription(
    params: PaystackCreateSubscriptionParams
  ): Promise<{
    status: boolean
    message: string
    data?: {
      customer: number
      plan: number
      authorization: number
      subscription_code: string
      email_token: string
      amount: number
      cron_expression: string
      next_payment_date: string
      open_invoices: number
      closed_invoices: number
      disable_email_notification: boolean
      created_at: string
    }
  }> {
    try {
      const response = await fetch(`${PAYSTACK_API_BASE}/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify(params),
      })

      return await response.json()
    } catch (error) {
      console.error("Paystack create subscription error:", error)
      throw error
    }
  },

  // Get a customer
  async getCustomer(
    customerIdOrCode: string | number
  ): Promise<{
    status: boolean
    message: string
    data?: {
      id: number
      customer_code: string
      first_name: string
      last_name: string
      email: string
      phone: string
      metadata: Record<string, any>
      domain: string
      subscriptions: any[]
      authorizations: any[]
      created_at: string
    }
  }> {
    try {
      const response = await fetch(
        `${PAYSTACK_API_BASE}/customer/${customerIdOrCode}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      )

      return await response.json()
    } catch (error) {
      console.error("Paystack get customer error:", error)
      throw error
    }
  },

  // Create or update a customer
  async createOrUpdateCustomer(
    email: string,
    firstName?: string,
    lastName?: string,
    phone?: string
  ): Promise<{
    status: boolean
    message: string
    data?: {
      id: number
      customer_code: string
      first_name: string
      last_name: string
      email: string
      phone: string
      metadata: Record<string, any>
      created_at: string
    }
  }> {
    try {
      const response = await fetch(`${PAYSTACK_API_BASE}/customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("Paystack create customer error:", error)
      throw error
    }
  },

  // Disable a subscription
  async disableSubscription(
    code: string,
    token: string
  ): Promise<{
    status: boolean
    message: string
  }> {
    try {
      const response = await fetch(
        `${PAYSTACK_API_BASE}/subscription/disable`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
          body: JSON.stringify({
            code,
            token,
          }),
        }
      )

      return await response.json()
    } catch (error) {
      console.error("Paystack disable subscription error:", error)
      throw error
    }
  },

  // Enable a subscription
  async enableSubscription(
    code: string,
    token: string
  ): Promise<{
    status: boolean
    message: string
  }> {
    try {
      const response = await fetch(`${PAYSTACK_API_BASE}/subscription/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          code,
          token,
        }),
      })

      return await response.json()
    } catch (error) {
      console.error("Paystack enable subscription error:", error)
      throw error
    }
  },

  getPublicKey(): string {
    return PAYSTACK_PUBLIC_KEY || ""
  },
}

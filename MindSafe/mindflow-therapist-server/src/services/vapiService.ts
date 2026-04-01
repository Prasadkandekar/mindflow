import axios from "axios";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = "https://api.vapi.ai";
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

// Debug logging
console.log("[VapiService] Environment variables loaded:");
console.log("  VAPI_API_KEY:", VAPI_API_KEY ? `${VAPI_API_KEY.substring(0, 8)}...` : "NOT SET");
console.log("  VAPI_PHONE_NUMBER_ID:", VAPI_PHONE_NUMBER_ID ? `${VAPI_PHONE_NUMBER_ID.substring(0, 8)}...` : "NOT SET");
console.log("  VAPI_ASSISTANT_ID:", VAPI_ASSISTANT_ID ? `${VAPI_ASSISTANT_ID.substring(0, 8)}...` : "NOT SET");

export interface OutboundCallRequest {
  phoneNumber: string;
  userName?: string;
  userId?: string;
  scheduledTime?: Date;
  assistantId?: string;
}

export interface OutboundCallResponse {
  success: boolean;
  callId?: string;
  status?: string;
  message?: string;
  error?: string | string[];
}

export class VapiService {
  /**
   * Create an outbound call using VAPI
   */
  static async createOutboundCall(
    request: OutboundCallRequest
  ): Promise<OutboundCallResponse> {
    try {
      if (!VAPI_API_KEY) {
        throw new Error("VAPI_API_KEY is not configured");
      }

      // Format phone number (ensure it has country code)
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber);

      // Prepare call payload
      // Try using assistantId first if available, otherwise use inline config
      const callPayload: any = {
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        customer: {
          number: formattedPhone,
        },
      };

      // Use assistant ID if configured (recommended for production)
      if (VAPI_ASSISTANT_ID && request.assistantId !== 'inline') {
        callPayload.assistantId = request.assistantId || VAPI_ASSISTANT_ID;
        console.log("[VapiService] Using assistant ID:", callPayload.assistantId);
      } else {
        // Use inline assistant configuration (for testing or custom configs)
        console.log("[VapiService] Using inline assistant configuration");
        callPayload.assistant = {
          firstMessage: "Hello! I'm your AI therapy assistant. I'm here to listen and support you. How are you feeling today?",
          model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content: `You are a compassionate AI therapy assistant named Mendy. 

Your role:
- Listen actively and show empathy
- Provide emotional support and validation
- Help users reflect on their feelings
- Suggest healthy coping strategies
- Create a safe, judgment-free space

Important rules:
- NEVER diagnose medical conditions
- NEVER prescribe medication
- NEVER replace professional therapy
- Always encourage seeking professional help for serious issues
- Be warm, caring, and supportive

Keep responses conversational and concise since this is a voice call.`,
              },
            ],
          },
          voice: {
            provider: "playht",
            voiceId: "jennifer",
          },
          name: "Therapy Assistant",
        };
      }

      // Add custom metadata
      if (request.userId || request.scheduledTime) {
        callPayload.metadata = {
          userId: request.userId,
          userName: request.userName,
          scheduledTime: request.scheduledTime?.toISOString(),
          callType: "therapy_session",
        };
      }

      console.log("[VapiService] Creating outbound call:", {
        phoneNumber: formattedPhone,
        userName: request.userName,
      });

      // Make API call to VAPI
      const response = await axios.post(
        `${VAPI_BASE_URL}/call/phone`,
        callPayload,
        {
          headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[VapiService] Call created successfully:", response.data);

      return {
        success: true,
        callId: response.data.id,
        status: response.data.status,
        message: "Outbound call initiated successfully",
      };
    } catch (error: any) {
      console.error("[VapiService] Error creating outbound call:", error);

      // Extract error message properly - handle both string and array formats
      let errorMessage = "Failed to create outbound call";
      
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        errorMessage = Array.isArray(msg) ? msg.join(", ") : msg;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      };
    }
  }

  /**
   * Get call status
   */
  static async getCallStatus(callId: string): Promise<any> {
    try {
      if (!VAPI_API_KEY) {
        throw new Error("VAPI_API_KEY is not configured");
      }

      const response = await axios.get(`${VAPI_BASE_URL}/call/${callId}`, {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
        },
      });

      return {
        success: true,
        call: response.data,
      };
    } catch (error: any) {
      console.error("[VapiService] Error getting call status:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Cancel/End a call
   */
  static async endCall(callId: string): Promise<OutboundCallResponse> {
    try {
      if (!VAPI_API_KEY) {
        throw new Error("VAPI_API_KEY is not configured");
      }

      await axios.delete(`${VAPI_BASE_URL}/call/${callId}`, {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
        },
      });

      return {
        success: true,
        message: "Call ended successfully",
      };
    } catch (error: any) {
      console.error("[VapiService] Error ending call:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Format phone number to E.164 format
   * Supports US (+1) and Indian (+91) numbers
   */
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // If already has country code, ensure + prefix
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      // Indian number with country code
      return "+" + cleaned;
    } else if (cleaned.startsWith("1") && cleaned.length === 11) {
      // US number with country code
      return "+" + cleaned;
    }

    // If 10 digits, determine country based on first digit
    if (cleaned.length === 10) {
      // Indian numbers typically start with 6, 7, 8, or 9
      if (["6", "7", "8", "9"].includes(cleaned[0])) {
        cleaned = "91" + cleaned; // Add India country code
      } else {
        cleaned = "1" + cleaned; // Add US country code
      }
    }

    // Add + prefix for E.164 format
    if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   * Supports US (10 digits) and Indian (10 digits) numbers
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Check if it's a valid length
    // 10 digits (local), 11 digits (US with country code), 12 digits (India with country code)
    if (cleaned.length === 10) {
      return true; // Valid local number
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return true; // Valid US number with country code
    } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
      return true; // Valid Indian number with country code
    }

    return false;
  }

  /**
   * Detect country from phone number
   */
  static detectCountry(phoneNumber: string): "US" | "IN" | "UNKNOWN" {
    const cleaned = phoneNumber.replace(/\D/g, "");

    if (cleaned.startsWith("91") || (cleaned.length === 10 && ["6", "7", "8", "9"].includes(cleaned[0]))) {
      return "IN";
    } else if (cleaned.startsWith("1") || cleaned.length === 10) {
      return "US";
    }

    return "UNKNOWN";
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CustomerEntry {
  id: string;
  date: string; // उदा. 21/09/2026
  time: string; // उदा. 11:30 AM (कोणत्या वेळेला केले)
  day: string; // उदा. सोमवार, मंगळवार (वार)
  timestamp: number;
  name: string; // ग्राहकाचे नाव
  mobile: string; // मोबाईल नंबर
  workDone: string; // केलेले काम
  paidAmount: number; // जमा रक्कम
  pendingAmount: number; // बाकी रक्कम
  totalAmount: number; // एकूण रक्कम
  address: string; // पत्ता
  otherInfo: string; // इतर माहिती
  profit?: number; // प्रॉफिट / नफा (₹)
  dueDateTime?: string; // काम किती वेळेपर्यंत व्हायला पाहिजे (मुदत तारीख आणि वेळ)
  isCompleted?: boolean; // काम पूर्ण झाले की नाही
  isMarkedIncomplete?: boolean; // अपूर्ण मध्ये टाकले आहे का (ON / OFF)
  incompleteReason?: string; // का अपूर्ण मध्ये आलेले आहे (कारण)
}

export interface ExpenseEntry {
  id: string;
  name: string; // नाव (कशावर खर्च केला / कोणाला दिले)
  amount: number; // खर्च रक्कम (₹)
  date: string; // दिनांक (उदा. 21/09/2026)
  time: string; // वेळ (उदा. 04:30 PM)
  timestamp: number;
  otherInfo?: string; // इतर माहिती / संदर्भ
}



# Video Consultation Feature — Implementation Plan

## Overview
Add peer-to-peer video calling (WebRTC) to the doctor directory, allowing patients to start video consultations from booked appointments. A signaling edge function will coordinate the WebRTC connection between two peers.

## Architecture

```text
Patient Browser  ←→  Signaling Edge Function (WebSocket-like via polling)  ←→  Doctor Browser
       ↕                                                                            ↕
   WebRTC Peer Connection (direct audio/video after signaling)
```

Since edge functions can't hold WebSocket connections long-term, we'll use a **database-backed signaling** approach: peers poll a `video_sessions` table for offers/answers/ICE candidates.

## Database Changes

**New table: `video_sessions`**
- `id` (uuid, PK) — maps to appointment ID
- `appointment_id` (uuid, FK → appointments)
- `patient_id` (uuid, FK → auth.users)
- `doctor_id` (integer)
- `status` (text: waiting, connected, ended)
- `offer` (jsonb, nullable) — WebRTC SDP offer
- `answer` (jsonb, nullable) — WebRTC SDP answer
- `ice_candidates` (jsonb[], nullable) — ICE candidates array
- `created_at`, `updated_at` (timestamptz)

RLS: Only the patient (by `patient_id`) can read/write their sessions. Enable realtime on this table for instant signaling.

## Component Structure

```text
src/
├── pages/
│   └── VideoCall.tsx              # Main video call page
├── components/video/
│   ├── WaitingRoom.tsx            # Pre-call check (camera/mic preview)
│   ├── VideoCallView.tsx          # Active call UI (2 video streams)
│   ├── CallControls.tsx           # Mute, camera, end call buttons
│   ├── CallTimer.tsx              # Elapsed time display
│   └── ConnectionStatus.tsx       # Connection state indicator
├── hooks/
│   └── useWebRTC.ts               # Core WebRTC logic + signaling
```

## Implementation Steps

### Step 1: Database & Realtime
- Create `video_sessions` table with RLS policies
- Enable realtime on the table for signaling

### Step 2: WebRTC Hook (`useWebRTC.ts`)
- Create/join a session by appointment ID
- Use `RTCPeerConnection` with free STUN servers (`stun:stun.l.google.com:19302`)
- Poll or subscribe to `video_sessions` table for SDP offer/answer exchange and ICE candidates
- Handle: connection state changes, ICE gathering, track events
- Reconnection: detect `connectionState === "disconnected"`, auto-retry ICE restart
- Timeout: if no answer within 60s, show "Doctor hasn't joined yet"

### Step 3: Waiting Room (`WaitingRoom.tsx`)
- Show local camera preview using `getUserMedia`
- Test mic levels (optional visual indicator)
- "Join Call" button that creates the WebRTC offer
- Display appointment details (doctor name, time)

### Step 4: Video Call View (`VideoCallView.tsx`)
- Two video elements: local (small PiP) + remote (full)
- `CallControls`: toggle mic (`track.enabled`), toggle camera, end call
- `CallTimer`: starts when remote stream connects
- `ConnectionStatus`: shows "Connecting...", "Connected", "Reconnecting..."

### Step 5: Integration Points
- Add route `/video-call/:appointmentId` in `App.tsx`
- In `BookingDialog.tsx` confirmation screen: show "Join Video Call" button for video appointments
- In `MyBookings.tsx`: add "Join Call" button on confirmed video appointments
- In `DoctorCard.tsx`: the existing video call button navigates to the video call page (after booking)

### Step 6: Edge Cases
- **Doctor not joining**: Show waiting message with timer, option to cancel after 5 min
- **Late join**: Second peer picks up existing offer from DB, sends answer
- **Network issues**: ICE restart on disconnect, UI shows "Reconnecting..."
- **Call end**: Both peers close connection, update session status to "ended"

## Key Technical Decisions
- **No TURN server**: Using STUN only (Google's free servers). Works for most networks; may fail behind strict symmetric NATs. Acceptable for MVP.
- **Signaling via Supabase Realtime**: Subscribe to `video_sessions` row changes instead of polling — instant and efficient.
- **No actual doctor-side app**: Since this is a patient-facing app, the "doctor" would need to open the same URL. For demo purposes, you can open two browser tabs.

## UI Design
- Dark healthcare theme consistent with existing app
- Waiting room: centered card with camera preview, gradient background
- Active call: full-screen remote video, draggable local video PiP in corner
- Controls bar at bottom: rounded pill with mic/camera/end-call icons
- Responsive: stacked layout on mobile, side-by-side on desktop

## Deployment Checklist
- Run migration for `video_sessions` table
- Verify realtime is enabled on the table
- Test with two browser tabs (one as patient, one as doctor)
- Verify HTTPS (required for `getUserMedia`)
- Test on mobile browsers


# Farsight — Holiday Package Booking Platform

A full-stack MERN application for browsing and booking curated holiday 
packages, with a real-time cart that syncs instantly across every open 
tab using WebSockets.

## Features
- 🏠 Homepage with featured package carousel & category browsing
- 📋 Package listing page with category filters & pagination
- ✈️ Detailed package pages with itinerary, inclusions & image gallery
- 🛒 Persistent cart with quantity controls
- ⚡ Real-time cart count sync across tabs/devices via Socket.IO
- 🎫 Distinctive boarding-pass inspired UI (ticket-stub cards, perforated edges)

## Tech Stack
**Frontend:** React, React Router, Vite, Socket.IO client  
**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO  
**Architecture:** REST API for CRUD operations + WebSocket layer for 
real-time cart broadcast (write via REST, sync via socket)
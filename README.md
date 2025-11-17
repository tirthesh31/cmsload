# FH CMS Load More / Load Less for Webflow

A lightweight JavaScript library to add **Load More** and **Load Less** functionality to Webflow Collection Lists with smooth animations and scrolling.

This library is designed to be plug-and-play for Webflow developers and agencies. It automatically handles multiple pages of CMS items and provides a smooth user experience.

---

## 📦 Installation

Include the script in your Webflow project by pasting the following **Inside the body**:

<script src="https://cdn.jsdelivr.net/gh/tirthesh31/cmsload@main/so-cmsload.min.js" defer></script>

## ⚙️ Setup Instructions

### 1. Collection List Element

Add a custom attribute to your Collection List wrapper:

Name: 

    so-cmsload-element

Value:

    list

### 2. Pagination Buttons

Load More Button

Turn on pagination in Webflow for your Collection List.

Give your Next button a custom attribute:

Name:

    so-cmsload-element

Value:

    loadMore

Load Less Button (Optional)

If you want users to scroll back to previous items, give your Previous button a custom attribute:

Name:

    so-cmsload-element

Value:

    loadLess


The script will dynamically handle showing/hiding the Load Less button as needed.

## 🎨 Features

Load More functionality for Webflow Collection Lists

Load Less functionality with smooth scrolling

Smooth fade-in animation for newly loaded items

Fully client-side; no server setup required

Works with standard Webflow pagination
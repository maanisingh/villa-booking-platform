#!/bin/bash

# Script to replace axios with API service in all files

FILES=(
  "src/components/PlatformIntegration/PlatformIntegrationDashboard.jsx"
  "src/Components/Shared/PublishVillaModal.jsx"
  "src/Components/Shared/EmailConfigForm.jsx"
  "src/Components/Shared/PlatformConnectionModal.jsx"
  "src/Components/OwnerDashboard/EmailSettings.jsx"
  "src/Components/OwnerDashboard/OwnerCalender.jsx"
  "src/Components/OwnerDashboard/OwnerProfile.jsx"
  "src/Components/OwnerDashboard/OwnerMyVillaInfo.jsx"
  "src/Components/OwnerDashboard/OwnerMyBooking.jsx"
  "src/Components/OwnerDashboard/PlatformIntegration.jsx"
  "src/Components/OwnerDashboard/OwnerPlatformSettings.jsx"
  "src/Components/AdminDashboard/AdminSetting.jsx"
  "src/Components/AdminDashboard/AdminOwners.jsx"
  "src/Components/AdminDashboard/AdminEmailSettings.jsx"
  "src/Components/AdminDashboard/AdminPlatformSettings.jsx"
  "src/Components/AdminDashboard/AdminVillaPlatformIntegration.jsx"
)

echo "Fixing API imports in ${#FILES[@]} files..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Calculate relative path to services/api.js
    depth=$(echo "$file" | grep -o "/" | wc -l)

    if [[ $file == src/components/* ]]; then
      api_path="../services/api"
    elif [[ $file == src/Components/Shared/* ]]; then
      api_path="../../services/api"
    elif [[ $file == src/Components/OwnerDashboard/* ]] || [[ $file == src/Components/AdminDashboard/* ]]; then
      api_path="../../services/api"
    else
      api_path="../services/api"
    fi

    # Replace axios import with API import
    sed -i 's|import axios from "axios"|import API from "'$api_path'"|g' "$file"

    # Replace axios.get/post/put/delete with API.get/post/put/delete
    sed -i 's/axios\./API./g' "$file"

    echo "✓ Fixed: $file"
  else
    echo "✗ Not found: $file"
  fi
done

echo "Done!"

// eas-update-hooks.js
module.exports = {
  async postPublish() {
    console.log('EAS Update: Publishing OTA update for APK distribution...');
    
    try {
      // Export the app for OTA
      console.log('Exporting app for OTA update...');
      const { execSync } = require('child_process');
      execSync('npx expo export --dev', { stdio: 'inherit' });
      
      // Publish the update
      console.log('Publishing OTA update...');
      execSync('eas update --message "App updated" --auto', { stdio: 'inherit' });
      
      console.log('OTA update published successfully for APK distribution!');
    } catch (error) {
      console.error('Error publishing OTA update:', error.message);
      throw error;
    }
  }
};
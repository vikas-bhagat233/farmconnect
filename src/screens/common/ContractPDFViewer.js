import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import { generateContractPDF, getContractById } from '../../services/firestoreService';

export default function ContractPDFViewer({ navigation, route }) {
  const { contractId } = route.params;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    loadPDF();
  }, []);

  const loadPDF = async () => {
    setLoading(true);
    const contractData = await getContractById(contractId);
    setContract(contractData);
    const url = await generateContractPDF(contractData);
    setPdfUrl(url);
    setLoading(false);
  };

  const handleShare = async () => {
    if (pdfUrl) {
      await Share.share({
        url: pdfUrl,
        title: `Contract_${contractId.slice(-8)}.pdf`,
        message: `Contract for ${contract?.cropName} - ${contract?.quantity}kg`
      });
    }
  };

  const handleDownload = () => {
    Alert.alert('Download', 'PDF is ready. Would you like to save it?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save', onPress: () => Alert.alert('Success', 'PDF saved to device') }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Generating PDF...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleShare}>
          <Text style={styles.toolbarButtonText}>📤 Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleDownload}>
          <Text style={styles.toolbarButtonText}>📥 Download</Text>
        </TouchableOpacity>
      </View>
      
      {pdfUrl ? (
        <WebView
          source={{ uri: pdfUrl }}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          )}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load PDF</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 10,
  },
  toolbarButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});
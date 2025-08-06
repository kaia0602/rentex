// src/components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          RENTEX 대시보드
        </Typography>
        <Button color="inherit">로그인</Button>
        <Button color="inherit">마이페이지</Button>
      </Toolbar>
    </AppBar>
  );
}

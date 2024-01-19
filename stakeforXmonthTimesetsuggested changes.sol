

    function StakeFor1Month(uint256 amount) public {
    amount = amount * 10**18;
    tokensStaked1Month[msg.sender] = tokensStaked1Month[msg.sender] + amount;

    _staked1MonthTimestamp[msg.sender] = block.timestamp;
    if (!_isStaked1Month[msg.sender]) {
        _isStaked1Month[msg.sender] = true;
        dividendTracker.setBalance(msg.sender, getStakingBalance(msg.sender));
    }
}


    function StakeFor3Months(uint256 amount) public {
        amount = amount * 10**18;
        tokensStaked3Months[msg.sender] = tokensStaked3Months[msg.sender] + amount;

        _staked3MonthsTimestamp[msg.sender] = block.timestamp;

        if (!_isStaked3Months[msg.sender]) {
             _isStaked3Months[msg.sender] = true;
        }

        dividendTracker.setBalance(msg.sender, getStakingBalance(msg.sender));
    }

    function StakeFor6Months(uint256 amount) public {
        amount = amount * 10**18;
        tokensStaked6Months[msg.sender] = tokensStaked6Months[msg.sender] + amount;

        // Update the timestamp every time the function is called
        _staked6MonthsTimestamp[msg.sender] = block.timestamp;

        if (!_isStaked6Months[msg.sender]) {
            _isStaked6Months[msg.sender] = true;
        }

        dividendTracker.setBalance(msg.sender, getStakingBalance(msg.sender));
    }
